import { createServerFn as createTanStackServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { and, eq, gte, gt, lte } from "drizzle-orm";
import { getAuth } from "./auth.server";
import { getDatabase } from "./runtime.server";
import { storage } from "./storage.server";
import {
  auditLogs,
  contributionPayments,
  contributionPeriods,
  contributionSchedules,
  contributionCredits,
  membershipApplications,
  membershipSelections,
  memberships,
  users,
} from "./db/schema";

const createServerFn: any = createTanStackServerFn;

const BUSINESS_TIMEZONE = "Africa/Johannesburg";
const POP_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_POP_SIZE = 10 * 1024 * 1024;

async function requireUser() {
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
  if (!session?.user) throw new Error("Authentication required.");
  return session.user;
}

async function requireAdmin() {
  const user = await requireUser();
  const database = getDatabase();
  const currentUser = await database.query.users.findFirst({ where: eq(users.id, user.id) });
  if (currentUser?.status !== "admin") throw new Error("Administrator access required.");
  return currentUser;
}

function dateParts(date: Date): { year: string; month: string; day: string } {
  const values = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return Object.fromEntries(
    values.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  ) as { year: string; month: string; day: string };
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function periodDates(year: number, month: number) {
  const start = `${monthKey(year, month)}-01`;
  const end = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  return { start, end, dueDate: start };
}

function periodStatus(dueDate: string, amountDue: number, amountPaid: number, now: string) {
  if (amountPaid >= amountDue) return "PAID";
  if (amountPaid > 0) return dueDate < now ? "OVERDUE" : "PARTIALLY_PAID";
  return dueDate < now ? "OVERDUE" : dueDate === now ? "DUE" : "UPCOMING";
}

function getCurrentPeriodKey(referenceDate: Date = new Date()) {
  const parts = dateParts(referenceDate);
  return {
    year: Number(parts["year"]),
    month: Number(parts["month"]),
    day: Number(parts["day"]),
  };
}

async function writeAudit(
  database: ReturnType<typeof getDatabase>,
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown>,
) {
  await database.insert(auditLogs).values({
    id: crypto.randomUUID(),
    actorUserId,
    action,
    entityType,
    entityId,
    metadata,
    createdAt: new Date(),
  });
}

async function applyAvailableCredits(
  database: ReturnType<typeof getDatabase>,
  membershipId: string,
  now: Date,
) {
  const [credits, periods] = await Promise.all([
    database.query.contributionCredits.findMany({
      where: and(
        eq(contributionCredits.membershipId, membershipId),
        gt(contributionCredits.remainingCents, 0),
      ),
    }),
    database.query.contributionPeriods.findMany({
      where: eq(contributionPeriods.membershipId, membershipId),
    }),
  ]);
  const orderedPeriods = [...periods].sort((left, right) =>
    left.periodStart.localeCompare(right.periodStart),
  );
  const orderedCredits = [...credits].sort(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
  );
  const current = getCurrentPeriodKey(now);
  const currentPeriodStart = `${monthKey(current.year, current.month)}-01`;

  for (const credit of orderedCredits) {
    const sourcePeriod = credit.sourcePeriodId
      ? periods.find((period) => period.id === credit.sourcePeriodId)
      : null;
    const target = orderedPeriods.find(
      (period) =>
        period.periodStart > (sourcePeriod?.periodStart ?? currentPeriodStart) &&
        !period.waivedReason &&
        !period.cancelledReason &&
        period.amountDueCents > period.amountPaidCents + period.creditAppliedCents,
    );
    if (!target) continue;
    const amount = Math.min(
      credit.remainingCents,
      Math.max(target.amountDueCents - target.amountPaidCents - target.creditAppliedCents, 0),
    );
    if (amount <= 0) continue;
    const creditAppliedCents = target.creditAppliedCents + amount;
    const remainingCents = credit.remainingCents - amount;
    const balanceCents = Math.max(
      target.amountDueCents - target.amountPaidCents - creditAppliedCents,
      0,
    );
    const status =
      balanceCents === 0
        ? "PAID"
        : target.amountPaidCents + creditAppliedCents > 0
          ? "PARTIALLY_PAID"
          : periodStatus(
              target.dueDate,
              target.amountDueCents,
              0,
              `${dateParts(now).year}-${String(dateParts(now).month).padStart(2, "0")}-${String(dateParts(now).day).padStart(2, "0")}`,
            );
    await database
      .update(contributionCredits)
      .set({ remainingCents, updatedAt: now })
      .where(eq(contributionCredits.id, credit.id));
    await database
      .update(contributionPeriods)
      .set({ creditAppliedCents, balanceCents, status, updatedAt: now })
      .where(eq(contributionPeriods.id, target.id));
    target.creditAppliedCents = creditAppliedCents;
    await writeAudit(
      database,
      credit.createdByUserId,
      "CONTRIBUTION_CREDIT_APPLIED",
      "contribution_period",
      target.id,
      {
        creditId: credit.id,
        membershipId,
        amountCents: amount,
      },
    );
  }
}

/**
 * Internal helper for creating contribution schedules (called during membership activation).
 * Used by both admin endpoint and activation workflow.
 * @param database Drizzle database instance
 * @param userId User ID (from membership.userId) for audit tracking
 * @param membershipId Membership unique identifier
 * @returns Object with schedule and created flag
 * @throws On membership not found, selection missing, or activation timestamp absent
 */
export async function createContributionScheduleInternal(
  database: ReturnType<typeof getDatabase>,
  userId: string,
  membershipId: string,
) {
  const membership = await database.query.memberships.findFirst({
    where: and(eq(memberships.id, membershipId), eq(memberships.status, "ACTIVE")),
  });
  if (!membership) throw new Error("Active membership not found.");
  const existing = await database.query.contributionSchedules.findFirst({
    where: eq(contributionSchedules.membershipId, membership.id),
  });
  if (existing) return { schedule: existing, created: false };
  const [application, selection] = await Promise.all([
    database.query.membershipApplications.findFirst({
      where: eq(membershipApplications.id, membership.applicationId),
    }),
    database.query.membershipSelections.findFirst({
      where: eq(membershipSelections.applicationId, membership.applicationId),
    }),
  ]);
  if (!application?.userId || !selection || !membership.activatedAt)
    throw new Error("Approved membership selection is incomplete.");
  const activated = dateParts(membership.activatedAt);
  const activatedYear = Number(activated["year"]);
  const activatedMonth = Number(activated["month"]);
  const startDate =
    monthKey(
      activatedYear + (activatedMonth === 12 ? 1 : 0),
      activatedMonth === 12 ? 1 : activatedMonth + 1,
    ) + "-01";
  const now = new Date();
  const schedule = {
    id: crypto.randomUUID(),
    membershipId: membership.id,
    userId: application.userId,
    ruleVersionId: selection.ruleVersionId,
    monthlyAmountCents: selection.monthlyContributionCents,
    currency: "ZAR",
    timezone: BUSINESS_TIMEZONE,
    startDate,
    dueDay: 1,
    status: "ACTIVE",
    statusReason: null,
    statusChangedAt: now,
    statusChangedByUserId: userId,
    createdAt: now,
    updatedAt: now,
  } as const;
  await database.insert(contributionSchedules).values(schedule);
  await writeAudit(
    database,
    userId,
    "CONTRIBUTION_SCHEDULE_CREATED",
    "contribution_schedule",
    schedule.id,
    { membershipId: membership.id },
  );
  return { schedule, created: true };
}

export const createContributionSchedule = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { membershipId: string } }) => {
    const admin = await requireAdmin();
    const database = getDatabase();
    const result = await createContributionScheduleInternal(database, admin.id, data.membershipId);
    return result;
  },
);

export async function ensureContributionPeriodsForMembership(
  database: ReturnType<typeof getDatabase>,
  membershipId: string,
  referenceDate: Date = new Date(),
) {
  const membership = await database.query.memberships.findFirst({
    where: eq(memberships.id, membershipId),
  });
  if (!membership) throw new Error("Membership not found.");
  const schedule = await database.query.contributionSchedules.findFirst({
    where: and(
      eq(contributionSchedules.membershipId, membershipId),
      eq(contributionSchedules.status, "ACTIVE"),
    ),
  });
  if (!schedule) return [];

  const current = getCurrentPeriodKey(referenceDate);
  const monthsToGenerate: Array<{ year: number; month: number }> = [];
  const startYear = Number(schedule.startDate.slice(0, 4));
  const startMonth = Number(schedule.startDate.slice(5, 7));
  let y = startYear;
  let m = startMonth;
  const endY = current.year;
  const endM = current.month;

  while (y < endY || (y === endY && m <= endM + 1)) {
    monthsToGenerate.push({ year: y, month: m });
    if (m === 12) {
      y += 1;
      m = 1;
    } else {
      m += 1;
    }
  }

  const createdPeriods: (typeof contributionPeriods.$inferSelect)[] = [];
  for (const periodTarget of monthsToGenerate) {
    const monthKeyForTarget = monthKey(periodTarget.year, periodTarget.month);
    const existing = await database.query.contributionPeriods.findFirst({
      where: and(
        eq(contributionPeriods.membershipId, membershipId),
        eq(contributionPeriods.periodYear, periodTarget.year),
        eq(contributionPeriods.periodMonth, periodTarget.month),
      ),
    });
    if (existing) continue;
    const dates = periodDates(periodTarget.year, periodTarget.month);
    const nowKey = `${current.year}-${String(current.month).padStart(2, "0")}-${String(current.day).padStart(2, "0")}`;
    const period = {
      id: crypto.randomUUID(),
      scheduleId: schedule.id,
      membershipId: membership.id,
      periodYear: periodTarget.year,
      periodMonth: periodTarget.month,
      periodStart: dates.start,
      periodEnd: dates.end,
      dueDate: dates.dueDate,
      amountDueCents: schedule.monthlyAmountCents,
      amountPaidCents: 0,
      balanceCents: schedule.monthlyAmountCents,
      overpaymentCents: 0,
      creditAppliedCents: 0,
      status: periodStatus(dates.dueDate, schedule.monthlyAmountCents, 0, nowKey),
      waivedReason: null,
      cancelledReason: null,
      createdAt: referenceDate,
      updatedAt: referenceDate,
    } as const;

    await database.insert(contributionPeriods).values(period);
    await writeAudit(
      database,
      membership.userId,
      "CONTRIBUTION_PERIOD_GENERATED",
      "contribution_period",
      period.id,
      {
        membershipId: membership.id,
        period: monthKeyForTarget,
      },
    );
    await applyAvailableCredits(database, membership.id, referenceDate);
    createdPeriods.push(period as typeof contributionPeriods.$inferSelect);
  }

  return createdPeriods;
}

export const generateContributionPeriod = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { periodYear?: number; periodMonth?: number } }) => {
    const user = await requireUser();
    const database = getDatabase();
    const schedule = await database.query.contributionSchedules.findFirst({
      where: and(
        eq(contributionSchedules.userId, user.id),
        eq(contributionSchedules.status, "ACTIVE"),
      ),
    });
    if (!schedule) throw new Error("Active contribution schedule not found.");
    const membership = await database.query.memberships.findFirst({
      where: and(
        eq(memberships.id, schedule.membershipId),
        eq(memberships.userId, user.id),
        eq(memberships.status, "ACTIVE"),
      ),
    });
    if (!membership) throw new Error("Active membership not found.");

    const now = new Date();
    const current = getCurrentPeriodKey(now);
    const year = data.periodYear ?? current.year;
    const month = data.periodMonth ?? current.month;
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12)
      throw new Error("Invalid contribution period.");

    const dates = periodDates(year, month);
    if (dates.start < schedule.startDate)
      throw new Error("Contribution period is before the schedule start date.");

    const existing = await database.query.contributionPeriods.findFirst({
      where: and(
        eq(contributionPeriods.membershipId, membership.id),
        eq(contributionPeriods.periodYear, year),
        eq(contributionPeriods.periodMonth, month),
      ),
    });
    if (existing) return { period: existing, created: false };

    const period = {
      id: crypto.randomUUID(),
      scheduleId: schedule.id,
      membershipId: membership.id,
      periodYear: year,
      periodMonth: month,
      periodStart: dates.start,
      periodEnd: dates.end,
      dueDate: dates.dueDate,
      amountDueCents: schedule.monthlyAmountCents,
      amountPaidCents: 0,
      balanceCents: schedule.monthlyAmountCents,
      overpaymentCents: 0,
      creditAppliedCents: 0,
      status: periodStatus(
        dates.dueDate,
        schedule.monthlyAmountCents,
        0,
        `${current.year}-${String(current.month).padStart(2, "0")}-${String(current.day).padStart(2, "0")}`,
      ),
      waivedReason: null,
      cancelledReason: null,
      createdAt: now,
      updatedAt: now,
    } as const;
    await database.insert(contributionPeriods).values(period);
    await writeAudit(
      database,
      user.id,
      "CONTRIBUTION_PERIOD_GENERATED",
      "contribution_period",
      period.id,
      { membershipId: membership.id, period: monthKey(year, month) },
    );
    await applyAvailableCredits(database, membership.id, now);
    return { period, created: true };
  },
);

export const submitContributionPayment = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: {
      periodId: string;
      amountSubmittedCents: number;
      paymentReference: string;
      paymentDate: string;
      popFileName: string;
      popMimeType: string;
      popSizeBytes: number;
      popDataBase64: string;
      idempotencyKey: string;
    };
  }) => {
    const user = await requireUser();
    const database = getDatabase();
    const schedule = await database.query.contributionSchedules.findFirst({
      where: and(
        eq(contributionSchedules.userId, user.id),
        eq(contributionSchedules.status, "ACTIVE"),
      ),
    });
    if (!schedule) throw new Error("Active contribution schedule not found.");
    const period = await database.query.contributionPeriods.findFirst({
      where: and(
        eq(contributionPeriods.id, data.periodId),
        eq(contributionPeriods.membershipId, schedule.membershipId),
      ),
    });
    if (!period) throw new Error("Contribution period not found.");
    if (!Number.isInteger(data.amountSubmittedCents) || data.amountSubmittedCents <= 0)
      throw new Error("Enter a valid contribution amount.");
    if (!data.paymentReference.trim() || !data.paymentDate.trim() || !data.idempotencyKey.trim())
      throw new Error("Payment reference, date and idempotency key are required.");
    if (
      !POP_MIME_TYPES.includes(data.popMimeType) ||
      data.popSizeBytes <= 0 ||
      data.popSizeBytes > MAX_POP_SIZE ||
      !data.popFileName.trim() ||
      !data.popDataBase64.trim()
    )
      throw new Error("A valid proof-of-payment file is required.");
    const existing = await database.query.contributionPayments.findFirst({
      where: and(
        eq(contributionPayments.userId, user.id),
        eq(contributionPayments.idempotencyKey, data.idempotencyKey),
      ),
    });
    if (existing) return { payment: existing, created: false };
    // Upload POP to R2
    const popStorageKey = storage.generatePopKey(
      schedule.membershipId,
      period.id,
      data.popFileName.trim(),
    );
    try {
      const binaryString = atob(data.popDataBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      await storage.upload({
        key: popStorageKey,
        data: bytes.buffer as ArrayBuffer,
        mimeType: data.popMimeType,
        metadata: { "member-id": schedule.membershipId, "period-id": period.id },
      });
    } catch (error) {
      throw new Error(
        `Failed to upload proof-of-payment: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
    const now = new Date();
    const payment = {
      id: crypto.randomUUID(),
      contributionPeriodId: period.id,
      membershipId: schedule.membershipId,
      userId: user.id,
      amountSubmittedCents: data.amountSubmittedCents,
      amountVerifiedCents: 0,
      paymentReference: data.paymentReference.trim(),
      paymentDate: data.paymentDate.trim(),
      status: "PENDING_VERIFICATION",
      popFileName: data.popFileName.trim(),
      popMimeType: data.popMimeType,
      popSizeBytes: data.popSizeBytes,
      popStorageKey: popStorageKey,
      submittedAt: now,
      verifiedAt: null,
      verifiedByUserId: null,
      reviewNotes: null,
      idempotencyKey: data.idempotencyKey.trim(),
      createdAt: now,
      updatedAt: now,
    } as const;
    await database.insert(contributionPayments).values(payment);
    await writeAudit(
      database,
      user.id,
      "CONTRIBUTION_PAYMENT_SUBMITTED",
      "contribution_payment",
      payment.id,
      { periodId: period.id, amountSubmittedCents: payment.amountSubmittedCents, popStorageKey },
    );
    return { payment, created: true };
  },
);

export const getAdminContributionQueue = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const database = getDatabase();
  const schedules = await database.query.contributionSchedules.findMany({});

  await Promise.all(
    schedules
      .filter((schedule) => schedule.status === "ACTIVE")
      .map((schedule) => ensureContributionPeriodsForMembership(database, schedule.membershipId)),
  );

  const [periods, payments] = await Promise.all([
    database.query.contributionPeriods.findMany({
      where: and(
        gte(contributionPeriods.balanceCents, 1),
        eq(contributionPeriods.status, "OVERDUE"),
      ),
    }),
    database.query.contributionPayments.findMany({
      where: eq(contributionPayments.status, "PENDING_VERIFICATION"),
    }),
  ]);

  return {
    schedules,
    periods,
    payments: await Promise.all(
      payments.map(async (payment) => {
        const membership = await database.query.memberships.findFirst({
          where: eq(memberships.id, payment.membershipId),
        });
        const user = membership
          ? await database.query.users.findFirst({ where: eq(users.id, membership.userId) })
          : null;
        const period = await database.query.contributionPeriods.findFirst({
          where: eq(contributionPeriods.id, payment.contributionPeriodId),
        });

        return {
          ...payment,
          memberName: user?.name ?? "Member",
          periodYear: period?.periodYear ?? null,
          periodMonth: period?.periodMonth ?? null,
          dueDate: period?.dueDate ?? null,
        };
      }),
    ),
  };
});

export const getContributionPaymentPreview = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { paymentId: string } }) => {
    await requireAdmin();
    const database = getDatabase();
    const payment = await database.query.contributionPayments.findFirst({
      where: eq(contributionPayments.id, data.paymentId),
    });
    if (!payment) throw new Error("Contribution payment not found.");

    try {
      const object = await storage.retrieve({ key: payment.popStorageKey });
      const base64 =
        typeof Buffer !== "undefined"
          ? Buffer.from(object.data).toString("base64")
          : btoa(
              Array.from(new Uint8Array(object.data))
                .map((byte) => String.fromCharCode(byte))
                .join(""),
            );

      return {
        id: payment.id,
        fileName: payment.popFileName,
        mimeType: payment.popMimeType,
        sizeBytes: payment.popSizeBytes,
        dataBase64: base64,
        storageKey: payment.popStorageKey,
      };
    } catch (error) {
      throw new Error(
        `Unable to load proof of payment from storage: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
);

async function recalculatePeriodTotals(
  database: ReturnType<typeof getDatabase>,
  periodId: string,
  now: Date,
) {
  const period = await database.query.contributionPeriods.findFirst({
    where: eq(contributionPeriods.id, periodId),
  });
  if (!period) return null;

  const verifiedPayments = await database.query.contributionPayments.findMany({
    where: and(
      eq(contributionPayments.contributionPeriodId, periodId),
      eq(contributionPayments.status, "VERIFIED"),
    ),
  });
  const totalVerifiedCents = verifiedPayments.reduce(
    (total, payment) => total + payment.amountVerifiedCents,
    0,
  );
  const parts = dateParts(now);
  const nowKey = `${parts["year"]}-${String(parts["month"]).padStart(2, "0")}-${String(parts["day"]).padStart(2, "0")}`;
  const status =
    period.waivedReason || period.cancelledReason
      ? period.waivedReason
        ? "WAIVED"
        : "CANCELLED"
      : periodStatus(period.dueDate, period.amountDueCents, totalVerifiedCents, nowKey);
  const balanceCents = Math.max(
    period.amountDueCents - totalVerifiedCents - period.creditAppliedCents,
    0,
  );
  const overpaymentCents = Math.max(totalVerifiedCents - period.amountDueCents, 0);

  await database
    .update(contributionPeriods)
    .set({
      amountPaidCents: totalVerifiedCents,
      balanceCents,
      overpaymentCents,
      status,
      updatedAt: now,
    })
    .where(eq(contributionPeriods.id, periodId));

  return { totalVerifiedCents, balanceCents, overpaymentCents, status };
}

export const updateContributionPayment = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: { paymentId: string; decision: "VERIFIED" | "REJECTED"; notes?: string };
  }) => {
    const admin = await requireAdmin();
    const database = getDatabase();
    const payment = await database.query.contributionPayments.findFirst({
      where: eq(contributionPayments.id, data.paymentId),
    });
    if (!payment) throw new Error("Contribution payment not found.");
    if (payment.status === data.decision) return { ok: true, status: payment.status };
    if (payment.status !== "PENDING_VERIFICATION")
      throw new Error("Only pending contribution payments can be reviewed.");
    const period = await database.query.contributionPeriods.findFirst({
      where: and(
        eq(contributionPeriods.id, payment.contributionPeriodId),
        eq(contributionPeriods.membershipId, payment.membershipId),
      ),
    });
    if (!period) throw new Error("Contribution period relationship is invalid.");
    const now = new Date();
    if (data.decision === "REJECTED") {
      await database
        .update(contributionPayments)
        .set({ status: "REJECTED", reviewNotes: data.notes?.trim() || null, updatedAt: now })
        .where(eq(contributionPayments.id, payment.id));
      await writeAudit(
        database,
        admin.id,
        "CONTRIBUTION_PAYMENT_REJECTED",
        "contribution_payment",
        payment.id,
        {
          periodId: period.id,
        },
      );
      return { ok: true, status: "REJECTED" as const };
    }

    await database
      .update(contributionPayments)
      .set({
        status: "VERIFIED",
        amountVerifiedCents: payment.amountSubmittedCents,
        reviewNotes: data.notes?.trim() || null,
        verifiedAt: now,
        verifiedByUserId: admin.id,
        updatedAt: now,
      })
      .where(eq(contributionPayments.id, payment.id));

    const totals = await recalculatePeriodTotals(database, period.id, now);
    if ((totals?.overpaymentCents ?? 0) > 0) {
      const existingCredits = await database.query.contributionCredits.findMany({
        where: and(
          eq(contributionCredits.sourcePeriodId, period.id),
          eq(contributionCredits.kind, "OVERPAYMENT"),
        ),
      });
      const alreadyCreditedCents = existingCredits.reduce(
        (total, credit) => total + credit.amountCents,
        0,
      );
      const newCreditCents = Math.max((totals?.overpaymentCents ?? 0) - alreadyCreditedCents, 0);
      if (newCreditCents > 0) {
        const credit = {
          id: crypto.randomUUID(),
          membershipId: payment.membershipId,
          userId: payment.userId,
          sourcePaymentId: payment.id,
          sourcePeriodId: period.id,
          amountCents: newCreditCents,
          remainingCents: newCreditCents,
          kind: "OVERPAYMENT",
          reason: "Verified contribution overpayment.",
          createdByUserId: admin.id,
          createdAt: now,
          updatedAt: now,
        } as const;
        await database.insert(contributionCredits).values(credit);
        await writeAudit(
          database,
          admin.id,
          "CONTRIBUTION_CREDIT_CREATED",
          "contribution_credit",
          credit.id,
          {
            paymentId: payment.id,
            periodId: period.id,
            amountCents: newCreditCents,
            reason: credit.reason,
          },
        );
      }
      await applyAvailableCredits(database, payment.membershipId, now);
    }
    await writeAudit(
      database,
      admin.id,
      "CONTRIBUTION_PAYMENT_VERIFIED",
      "contribution_payment",
      payment.id,
      {
        periodId: period.id,
        amountVerifiedCents: payment.amountSubmittedCents,
        balanceCents: totals?.balanceCents ?? 0,
        overpaymentCents: totals?.overpaymentCents ?? 0,
      },
    );

    return {
      ok: true,
      status: "VERIFIED" as const,
      balanceCents: totals?.balanceCents ?? 0,
      overpaymentCents: totals?.overpaymentCents ?? 0,
    };
  },
);

export const adjustContributionCredit = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { membershipId: string; amountCents: number; reason: string } }) => {
    const admin = await requireAdmin();
    const reason = data.reason.trim();
    if (!Number.isInteger(data.amountCents) || data.amountCents === 0 || !reason) {
      throw new Error("A non-zero credit amount and reason are required.");
    }
    const database = getDatabase();
    const membership = await database.query.memberships.findFirst({
      where: eq(memberships.id, data.membershipId),
    });
    if (!membership) throw new Error("Membership not found.");
    const now = new Date();
    if (data.amountCents < 0) {
      const credits = await database.query.contributionCredits.findMany({
        where: and(
          eq(contributionCredits.membershipId, membership.id),
          gt(contributionCredits.remainingCents, 0),
        ),
      });
      const availableCents = credits.reduce((total, credit) => total + credit.remainingCents, 0);
      if (availableCents < Math.abs(data.amountCents))
        throw new Error("Credit adjustment exceeds available credit.");
      let remainingToAdjust = Math.abs(data.amountCents);
      for (const credit of credits.sort(
        (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
      )) {
        const consumed = Math.min(credit.remainingCents, remainingToAdjust);
        if (!consumed) continue;
        await database
          .update(contributionCredits)
          .set({ remainingCents: credit.remainingCents - consumed, updatedAt: now })
          .where(eq(contributionCredits.id, credit.id));
        remainingToAdjust -= consumed;
        if (!remainingToAdjust) break;
      }
    }
    const adjustment = {
      id: crypto.randomUUID(),
      membershipId: membership.id,
      userId: membership.userId,
      sourcePaymentId: null,
      sourcePeriodId: null,
      amountCents: data.amountCents,
      remainingCents: Math.max(data.amountCents, 0),
      kind: "MANUAL_ADJUSTMENT",
      reason,
      createdByUserId: admin.id,
      createdAt: now,
      updatedAt: now,
    } as const;
    await database.insert(contributionCredits).values(adjustment);
    await applyAvailableCredits(database, membership.id, now);
    await writeAudit(
      database,
      admin.id,
      "CONTRIBUTION_CREDIT_ADJUSTED",
      "contribution_credit",
      adjustment.id,
      {
        membershipId: membership.id,
        amountCents: data.amountCents,
        reason,
      },
    );
    return { ok: true, adjustment };
  },
);

export const updateContributionScheduleStatus = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: { scheduleId: string; status: "ACTIVE" | "PAUSED"; reason: string };
  }) => {
    const admin = await requireAdmin();
    const reason = data.reason.trim();
    if (!reason) throw new Error("A reason is required to pause or resume a schedule.");
    const database = getDatabase();
    const schedule = await database.query.contributionSchedules.findFirst({
      where: eq(contributionSchedules.id, data.scheduleId),
    });
    if (!schedule) throw new Error("Contribution schedule not found.");
    if (schedule.status === data.status) return { ok: true, changed: false, schedule };
    const now = new Date();
    await database
      .update(contributionSchedules)
      .set({
        status: data.status,
        statusReason: reason,
        statusChangedAt: now,
        statusChangedByUserId: admin.id,
        updatedAt: now,
      })
      .where(eq(contributionSchedules.id, schedule.id));
    await writeAudit(
      database,
      admin.id,
      data.status === "PAUSED" ? "CONTRIBUTION_SCHEDULE_PAUSED" : "CONTRIBUTION_SCHEDULE_RESUMED",
      "contribution_schedule",
      schedule.id,
      {
        membershipId: schedule.membershipId,
        reason,
      },
    );
    return { ok: true, changed: true, status: data.status };
  },
);
