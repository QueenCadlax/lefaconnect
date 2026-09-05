import { createServerFn as createTanStackServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { getAuth } from "./auth.server";
import { getDatabase } from "./runtime.server";
import {
  applicantProfiles,
  applicationSteps,
  membershipApplications,
  membershipRuleVersions,
  membershipSelections,
  memberships,
  membershipSlots,
  nextOfKin,
  payments,
  referrals,
  contributionPayments,
  contributionPeriods,
  contributionSchedules,
  users,
  auditLogs,
} from "./db/schema";
import { createContributionScheduleInternal } from "./contributions.server";

const createServerFn: any = createTanStackServerFn;

const STEP_KEYS = [
  "personal",
  "contact",
  "community",
  "kin",
  "membership",
  "documents",
  "selection",
  "agreement",
  "payment",
  "approval",
] as const;
const LOCKED_APPLICATION_STATUSES = [
  "PENDING_REVIEW",
  "APPROVED_PENDING_PAYMENT",
  "PAYMENT_PENDING_VERIFICATION",
  "ACTIVE",
  "REJECTED",
  "CHANGES_REQUESTED",
];
const applicationReference = () =>
  `LC-${new Date().getFullYear()}-${crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase()}`;

async function requireUser() {
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
  if (!session?.user) throw new Error("Authentication required.");
  return session.user;
}

async function requireAdmin() {
  const user = await requireUser();
  const database = getDatabase();
  const currentUser = await database.query.users.findFirst({
    where: eq(users.id, user.id),
  });
  if (currentUser?.status !== "admin") throw new Error("Administrator access required.");
  return currentUser;
}

async function writeAudit(
  database: ReturnType<typeof getDatabase>,
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
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

async function ownedApplication() {
  const user = await requireUser();
  const database = getDatabase();
  const application = await database.query.membershipApplications.findFirst({
    where: eq(membershipApplications.userId, user.id),
  });
  return { user, database, application };
}

async function markStep(
  database: ReturnType<typeof getDatabase>,
  applicationId: string,
  stepKey: string,
  status: string,
) {
  const now = new Date();
  await database
    .insert(applicationSteps)
    .values({
      id: crypto.randomUUID(),
      applicationId,
      stepKey,
      status,
      completedAt: status === "complete" ? now : null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [applicationSteps.applicationId, applicationSteps.stepKey],
      set: { status, completedAt: status === "complete" ? now : null, updatedAt: now },
    });
}

export const getApplicantWorkspace = createServerFn({ method: "GET" }).handler(async () => {
  const { user, database, application } = await ownedApplication();
  if (!application)
    return {
      user: { name: user.name, email: user.email },
      application: null,
      steps: [],
      rules: [],
    };
  const [profile, kin, selection, payment, membership, steps, rules] = await Promise.all([
    database.query.applicantProfiles.findFirst({
      where: eq(applicantProfiles.id, application.profileId),
    }),
    database.query.nextOfKin.findMany({ where: eq(nextOfKin.applicationId, application.id) }),
    database.query.membershipSelections.findFirst({
      where: eq(membershipSelections.applicationId, application.id),
    }),
    database.query.payments.findFirst({
      where: eq(payments.applicationId, application.id),
    }),
    database.query.memberships.findFirst({
      where: eq(memberships.applicationId, application.id),
    }),
    database.query.applicationSteps.findMany({
      where: eq(applicationSteps.applicationId, application.id),
    }),
    database.query.membershipRuleVersions.findMany({
      where: eq(membershipRuleVersions.status, "active"),
    }),
  ]);
  return {
    user: { name: user.name, email: user.email },
    application: {
      id: application.id,
      reference: application.applicationReference,
      status: application.status,
      membershipCategory: application.membershipCategory,
      submittedAt: application.submittedAt,
      profile,
      kin,
      selection,
      payment: payment
        ? {
            id: payment.id,
            amountDueCents: payment.amountDueCents,
            amountPaidCents: payment.amountPaidCents,
            paymentReference: payment.paymentReference,
            paymentDate: payment.paymentDate,
            status: payment.status,
            popFileName: payment.popFileName,
            popMimeType: payment.popMimeType,
            popSizeBytes: payment.popSizeBytes,
            submittedAt: payment.submittedAt,
            reviewNotes: payment.reviewNotes,
          }
        : null,
      membership: membership
        ? {
            id: membership.id,
            membershipNumber: membership.membershipNumber,
            status: membership.status,
            activatedAt: membership.activatedAt,
          }
        : null,
      referralName: application.referralName,
    },
    steps,
    rules,
  };
});

export const getMemberDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const { user, database, application } = await ownedApplication();
  if (!application) throw new Error("Member application not found.");
  const [profile, selection, paymentsList, membership, steps] = await Promise.all([
    database.query.applicantProfiles.findFirst({
      where: eq(applicantProfiles.id, application.profileId),
    }),
    database.query.membershipSelections.findFirst({
      where: eq(membershipSelections.applicationId, application.id),
    }),
    database.query.payments.findMany({
      where: eq(payments.applicationId, application.id),
      orderBy: (fields, operators) => operators.desc(fields.submittedAt),
    }),
    database.query.memberships.findFirst({
      where: and(eq(memberships.applicationId, application.id), eq(memberships.userId, user.id)),
    }),
    database.query.applicationSteps.findMany({
      where: eq(applicationSteps.applicationId, application.id),
    }),
  ]);
  if (!membership || membership.status !== "ACTIVE" || application.status !== "ACTIVE")
    throw new Error("Active membership not found.");
  const slots = await database.query.membershipSlots.findMany({
    where: eq(membershipSlots.membershipId, membership.id),
  });
  const schedule = await database.query.contributionSchedules.findFirst({
    where: and(
      eq(contributionSchedules.membershipId, membership.id),
      eq(contributionSchedules.userId, user.id),
    ),
  });
  const contributionPeriodsList = schedule
    ? await database.query.contributionPeriods.findMany({
        where: eq(contributionPeriods.scheduleId, schedule.id),
        orderBy: (fields, operators) => operators.desc(fields.dueDate),
      })
    : [];
  return {
    user: { name: user.name, email: user.email },
    profile,
    application: {
      id: application.id,
      reference: application.applicationReference,
      status: application.status,
      membershipCategory: application.membershipCategory,
      livestockCount: application.livestockCount,
      livestockTypes: application.livestockTypes,
      referralName: application.referralName,
    },
    selection,
    payment: paymentsList[0]
      ? {
          status: paymentsList[0].status,
          amountDueCents: paymentsList[0].amountDueCents,
          amountPaidCents: paymentsList[0].amountPaidCents,
          paymentReference: paymentsList[0].paymentReference,
          paymentDate: paymentsList[0].paymentDate,
          submittedAt: paymentsList[0].submittedAt,
        }
      : null,
    paymentHistory: paymentsList.map((payment) => ({
      id: payment.id,
      status: payment.status,
      amountDueCents: payment.amountDueCents,
      amountPaidCents: payment.amountPaidCents,
      paymentReference: payment.paymentReference,
      paymentDate: payment.paymentDate,
      submittedAt: payment.submittedAt,
    })),
    outstandingBalanceCents: paymentsList.reduce(
      (balance, payment) => balance + Math.max(payment.amountDueCents - payment.amountPaidCents, 0),
      0,
    ),
    totalPaidCents: paymentsList.reduce((total, payment) => total + payment.amountPaidCents, 0),
    outstandingActions: steps
      .filter((step) => step.status !== "complete")
      .map((step) => step.stepKey),
    contributionSchedule: schedule
      ? {
          id: schedule.id,
          monthlyAmountCents: schedule.monthlyAmountCents,
          currency: schedule.currency,
          timezone: schedule.timezone,
          startDate: schedule.startDate,
          dueDay: schedule.dueDay,
          status: schedule.status,
        }
      : null,
    contributionPeriods: contributionPeriodsList,
    membership: {
      id: membership.id,
      membershipNumber: membership.membershipNumber,
      status: membership.status,
      activatedAt: membership.activatedAt,
      slots,
    },
  };
});

export const getAdminDashboardSummary = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const database = getDatabase();

  const [
    totalApplications,
    pendingReview,
    paymentPendingVerification,
    activeMembers,
    pendingContributionPayments,
    recentAuditLogs,
  ] = await Promise.all([
    database.query.membershipApplications.findMany(),
    database.query.membershipApplications.findMany({
      where: eq(membershipApplications.status, "PENDING_REVIEW"),
    }),
    database.query.payments.findMany({
      where: eq(payments.status, "PENDING_VERIFICATION"),
    }),
    database.query.memberships.findMany({
      where: eq(memberships.status, "ACTIVE"),
    }),
    database.query.contributionPayments.findMany({
      where: eq(contributionPayments.status, "PENDING_VERIFICATION"),
    }),
    database.query.auditLogs.findMany({
      orderBy: (fields, operators) => operators.desc(fields.createdAt),
      limit: 10,
    }),
  ]);

  return {
    stats: {
      totalApplications: totalApplications.length,
      pendingReview: pendingReview.length,
      paymentPendingVerification: paymentPendingVerification.length,
      activeMembers: activeMembers.length,
      pendingContributionPayments: pendingContributionPayments.length,
    },
    recentAuditLogs: recentAuditLogs.map((entry) => ({
      id: entry.id,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      createdAt: entry.createdAt,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    })),
  };
});

export const getAdminMemberList = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const database = getDatabase();
  const members = await database.query.memberships.findMany({
    orderBy: (fields, operators) => operators.desc(fields.activatedAt ?? fields.createdAt),
  });

  const rows = await Promise.all(
    members.map(async (membership) => {
      const [user, application, selection, slots, schedule, memberPeriods, latestPayment] =
        await Promise.all([
          database.query.users.findFirst({ where: eq(users.id, membership.userId) }),
          database.query.membershipApplications.findFirst({
            where: eq(membershipApplications.id, membership.applicationId),
          }),
          database.query.membershipSelections.findFirst({
            where: eq(membershipSelections.applicationId, membership.applicationId),
          }),
          database.query.membershipSlots.findMany({
            where: eq(membershipSlots.membershipId, membership.id),
          }),
          database.query.contributionSchedules.findFirst({
            where: eq(contributionSchedules.membershipId, membership.id),
          }),
          database.query.contributionPeriods.findMany({
            where: eq(contributionPeriods.membershipId, membership.id),
            orderBy: (fields, operators) => operators.desc(fields.periodYear),
          }),
          database.query.payments.findFirst({
            where: eq(payments.applicationId, membership.applicationId),
            orderBy: (fields, operators) => operators.desc(fields.submittedAt),
          }),
        ]);

      const totalContributionBalance = memberPeriods.reduce(
        (sum, entry) => sum + entry.balanceCents,
        0,
      );
      const totalContributionPaid = memberPeriods.reduce(
        (sum, entry) => sum + entry.amountPaidCents,
        0,
      );

      return {
        id: membership.id,
        membershipNumber: membership.membershipNumber,
        status: membership.status,
        activatedAt: membership.activatedAt,
        applicationReference: application?.applicationReference ?? "—",
        membershipCategory: application?.membershipCategory ?? "—",
        memberName: user?.name ?? "Unknown member",
        memberEmail: user?.email ?? "—",
        slotCount: slots.length,
        shareCount: selection?.shareCount ?? 0,
        monthlyContributionCents: selection?.monthlyContributionCents ?? 0,
        scheduleStatus: schedule?.status ?? "NONE",
        totalContributionPaidCents: totalContributionPaid,
        totalContributionBalanceCents: totalContributionBalance,
        paymentStatus: latestPayment?.status ?? "NO_RECORD",
      };
    }),
  );

  return { members: rows };
});

export const getAdminMemberDetail = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { membershipId: string } }) => {
    await requireAdmin();
    const database = getDatabase();
    const membership = await database.query.memberships.findFirst({
      where: eq(memberships.id, data.membershipId),
    });

    if (!membership) throw new Error("Member record not found.");

    const [
      user,
      application,
      selection,
      slots,
      schedule,
      memberPeriods,
      paymentHistory,
      latestAudit,
    ] = await Promise.all([
      database.query.users.findFirst({ where: eq(users.id, membership.userId) }),
      database.query.membershipApplications.findFirst({
        where: eq(membershipApplications.id, membership.applicationId),
      }),
      database.query.membershipSelections.findFirst({
        where: eq(membershipSelections.applicationId, membership.applicationId),
      }),
      database.query.membershipSlots.findMany({
        where: eq(membershipSlots.membershipId, membership.id),
      }),
      database.query.contributionSchedules.findFirst({
        where: eq(contributionSchedules.membershipId, membership.id),
      }),
      database.query.contributionPeriods.findMany({
        where: eq(contributionPeriods.membershipId, membership.id),
        orderBy: (fields, operators) => operators.desc(fields.periodYear),
      }),
      database.query.payments.findMany({
        where: eq(payments.userId, membership.userId),
        orderBy: (fields, operators) => operators.desc(fields.submittedAt),
      }),
      database.query.auditLogs.findFirst({
        where: eq(auditLogs.entityType, "membership"),
        orderBy: (fields, operators) => operators.desc(fields.createdAt),
      }),
    ]);

    return {
      id: membership.id,
      membershipNumber: membership.membershipNumber,
      status: membership.status,
      activatedAt: membership.activatedAt,
      memberName: user?.name ?? "Unknown member",
      memberEmail: user?.email ?? "—",
      applicationReference: application?.applicationReference ?? "—",
      membershipCategory: application?.membershipCategory ?? "—",
      shareCount: selection?.shareCount ?? 0,
      slotCount: selection?.slotCount ?? slots.length,
      monthlyContributionCents: selection?.monthlyContributionCents ?? 0,
      slots: slots.map((slot) => ({
        id: slot.id,
        slotNumber: slot.slotNumber,
        status: slot.status,
        approvedAt: slot.approvedAt,
      })),
      schedule: schedule
        ? {
            id: schedule.id,
            status: schedule.status,
            monthlyAmountCents: schedule.monthlyAmountCents,
            startDate: schedule.startDate,
            dueDay: schedule.dueDay,
          }
        : null,
      contributionPeriods: memberPeriods.map((period) => ({
        id: period.id,
        periodYear: period.periodYear,
        periodMonth: period.periodMonth,
        amountDueCents: period.amountDueCents,
        amountPaidCents: period.amountPaidCents,
        balanceCents: period.balanceCents,
        status: period.status,
      })),
      paymentHistory: paymentHistory.map((payment) => ({
        id: payment.id,
        status: payment.status,
        amountDueCents: payment.amountDueCents,
        amountPaidCents: payment.amountPaidCents,
        paymentReference: payment.paymentReference,
        paymentDate: payment.paymentDate,
        submittedAt: payment.submittedAt,
      })),
      latestAudit: latestAudit
        ? {
            id: latestAudit.id,
            action: latestAudit.action,
            entityId: latestAudit.entityId,
            createdAt: latestAudit.createdAt,
          }
        : null,
    };
  },
);

export const getAdminReviewQueue = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const database = getDatabase();
  const applications = await database.query.membershipApplications.findMany({
    where: eq(membershipApplications.status, "PENDING_REVIEW"),
    orderBy: (fields, operators) => operators.desc(fields.submittedAt),
  });

  const queue = await Promise.all(
    applications.map(async (application) => {
      const [profile, kin, selection, applicant] = await Promise.all([
        database.query.applicantProfiles.findFirst({
          where: eq(applicantProfiles.id, application.profileId),
        }),
        database.query.nextOfKin.findMany({
          where: eq(nextOfKin.applicationId, application.id),
        }),
        database.query.membershipSelections.findFirst({
          where: eq(membershipSelections.applicationId, application.id),
        }),
        database.query.users.findFirst({ where: eq(users.id, application.userId) }),
      ]);

      return {
        id: application.id,
        reference: application.applicationReference,
        status: application.status,
        submittedAt: application.submittedAt,
        membershipCategory: application.membershipCategory,
        reasonForJoining: application.reasonForJoining,
        referralName: application.referralName,
        applicant: applicant
          ? { id: applicant.id, name: applicant.name, email: applicant.email }
          : null,
        profile,
        kin,
        selection,
      };
    }),
  );

  return { applications: queue };
});

export const getAdminApplicationDetail = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { applicationId: string } }) => {
    await requireAdmin();
    const database = getDatabase();
    const application = await database.query.membershipApplications.findFirst({
      where: eq(membershipApplications.id, data.applicationId),
    });

    if (!application) throw new Error("Application not found.");

    const [profile, kin, selection, applicant] = await Promise.all([
      database.query.applicantProfiles.findFirst({
        where: eq(applicantProfiles.id, application.profileId),
      }),
      database.query.nextOfKin.findMany({
        where: eq(nextOfKin.applicationId, application.id),
      }),
      database.query.membershipSelections.findFirst({
        where: eq(membershipSelections.applicationId, application.id),
      }),
      database.query.users.findFirst({ where: eq(users.id, application.userId) }),
    ]);

    return {
      id: application.id,
      reference: application.applicationReference,
      status: application.status,
      submittedAt: application.submittedAt,
      membershipCategory: application.membershipCategory,
      reasonForJoining: application.reasonForJoining,
      referralName: application.referralName,
      applicant: applicant
        ? { id: applicant.id, name: applicant.name, email: applicant.email }
        : null,
      profile,
      kin,
      selection,
    };
  },
);

export const updateApplicationReview = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: {
      applicationId: string;
      decision: "APPROVED_PENDING_PAYMENT" | "REJECTED" | "CHANGES_REQUESTED";
      notes?: string;
    };
  }) => {
    await requireAdmin();
    const database = getDatabase();
    const application = await database.query.membershipApplications.findFirst({
      where: eq(membershipApplications.id, data.applicationId),
    });

    if (!application) throw new Error("Application not found.");
    if (application.status !== "PENDING_REVIEW")
      throw new Error("Only applications with status PENDING_REVIEW can be reviewed.");

    const now = new Date();
    await database
      .update(membershipApplications)
      .set({
        status: data.decision,
        updatedAt: now,
      })
      .where(eq(membershipApplications.id, data.applicationId));

    await writeAudit(
      database,
      application.userId,
      "APPLICATION_REVIEWED",
      "membership_application",
      application.id,
      {
        decision: data.decision,
        reviewerUserId: (await requireAdmin()).id,
        notes: data.notes?.trim() || null,
      },
    );

    return {
      ok: true,
      applicationId: application.id,
      reference: application.applicationReference,
      status: data.decision,
      notes: data.notes?.trim() || null,
    };
  },
);

export const submitJoiningPayment = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: {
      paymentReference: string;
      paymentDate: string;
      amountPaidCents: number;
      popFileName: string;
      popMimeType: string;
      popSizeBytes: number;
      popDataBase64: string;
    };
  }) => {
    const { user, database, application } = await ownedApplication();
    if (!application || application.status !== "APPROVED_PENDING_PAYMENT")
      throw new Error("Joining payment is not available for this application.");
    const selection = await database.query.membershipSelections.findFirst({
      where: eq(membershipSelections.applicationId, application.id),
    });
    if (!selection) throw new Error("Approved membership selection not found.");
    if (!data.paymentReference.trim() || !data.paymentDate.trim())
      throw new Error("Enter the payment reference and payment date.");
    if (!Number.isInteger(data.amountPaidCents) || data.amountPaidCents <= 0)
      throw new Error("Enter a valid amount paid.");
    if (data.amountPaidCents !== selection.joiningFeeCents)
      throw new Error("Amount paid must match the approved joining fee.");
    if (!data.popFileName.trim() || !data.popMimeType || !data.popDataBase64)
      throw new Error("Upload proof of payment before submitting.");
    if (!["application/pdf", "image/jpeg", "image/png"].includes(data.popMimeType))
      throw new Error("Proof of payment must be a PDF, JPG or PNG file.");
    if (data.popSizeBytes <= 0 || data.popSizeBytes > 10 * 1024 * 1024)
      throw new Error("Proof of payment must be 10 MB or smaller.");
    const existing = await database.query.payments.findFirst({
      where: eq(payments.applicationId, application.id),
    });
    if (existing && existing.status === "PENDING_VERIFICATION")
      throw new Error("A payment submission is already awaiting verification.");
    const now = new Date();
    const paymentValues = {
      applicationId: application.id,
      userId: user.id,
      paymentType: "JOINING_FEE",
      amountDueCents: selection.joiningFeeCents,
      amountPaidCents: data.amountPaidCents,
      paymentReference: data.paymentReference.trim(),
      paymentDate: data.paymentDate.trim(),
      status: "PENDING_VERIFICATION",
      popFileName: data.popFileName.trim(),
      popMimeType: data.popMimeType,
      popSizeBytes: data.popSizeBytes,
      popStorageKey: `payments/${application.id}/${crypto.randomUUID()}-${data.popFileName.trim()}`,
      popDataBase64: data.popDataBase64,
      reviewNotes: null,
      submittedAt: now,
      verifiedAt: null,
      updatedAt: now,
    } as const;
    if (existing) {
      await database.update(payments).set(paymentValues).where(eq(payments.id, existing.id));
    } else {
      await database
        .insert(payments)
        .values({ id: crypto.randomUUID(), createdAt: now, ...paymentValues });
    }
    await database
      .update(membershipApplications)
      .set({ status: "PAYMENT_PENDING_VERIFICATION", updatedAt: now })
      .where(eq(membershipApplications.id, application.id));
    return { ok: true, status: "PENDING_VERIFICATION" as const };
  },
);

export const getAdminPaymentQueue = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const database = getDatabase();
  const records = await database.query.payments.findMany({
    where: eq(payments.status, "PENDING_VERIFICATION"),
    orderBy: (fields, operators) => operators.desc(fields.submittedAt),
  });
  return {
    payments: await Promise.all(
      records.map(async (payment) => {
        const [application, profile] = await Promise.all([
          database.query.membershipApplications.findFirst({
            where: eq(membershipApplications.id, payment.applicationId),
          }),
          database.query.applicantProfiles.findFirst({
            where: eq(applicantProfiles.userId, payment.userId),
          }),
        ]);
        return {
          id: payment.id,
          applicationId: payment.applicationId,
          applicationReference: application?.applicationReference ?? "—",
          applicantName: profile ? `${profile.firstName} ${profile.lastName}`.trim() : "—",
          amountDueCents: payment.amountDueCents,
          amountPaidCents: payment.amountPaidCents,
          paymentReference: payment.paymentReference,
          paymentDate: payment.paymentDate,
          popFileName: payment.popFileName,
          popMimeType: payment.popMimeType,
          popSizeBytes: payment.popSizeBytes,
          popStorageKey: payment.popStorageKey,
          popDataBase64: payment.popDataBase64,
          submittedAt: payment.submittedAt,
          status: payment.status,
          reviewNotes: payment.reviewNotes,
        };
      }),
    ),
  };
});

export const updatePaymentVerification = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: {
      paymentId: string;
      decision: "VERIFIED" | "REJECTED";
      notes?: string;
    };
  }) => {
    await requireAdmin();
    const database = getDatabase();
    const payment = await database.query.payments.findFirst({
      where: eq(payments.id, data.paymentId),
    });
    if (!payment) throw new Error("Payment record not found.");
    const application = await database.query.membershipApplications.findFirst({
      where: eq(membershipApplications.id, payment.applicationId),
    });
    if (!application) throw new Error("Payment application not found.");
    if (
      data.decision === "VERIFIED" &&
      payment.status === "VERIFIED" &&
      application.status === "ACTIVE"
    ) {
      const existingMembership = await database.query.memberships.findFirst({
        where: eq(memberships.applicationId, application.id),
      });
      if (!existingMembership)
        throw new Error("Activated application is missing its membership record.");
      return {
        ok: true,
        status: "VERIFIED" as const,
        membershipNumber: existingMembership.membershipNumber,
      };
    }
    if (payment.status !== "PENDING_VERIFICATION")
      throw new Error("Only pending payments can be reviewed.");
    const now = new Date();
    if (data.decision === "REJECTED") {
      await database
        .update(payments)
        .set({
          status: "REJECTED",
          reviewNotes: data.notes?.trim() || null,
          verifiedAt: null,
          updatedAt: now,
        })
        .where(eq(payments.id, payment.id));
      await database
        .update(membershipApplications)
        .set({ status: "APPROVED_PENDING_PAYMENT", updatedAt: now })
        .where(eq(membershipApplications.id, payment.applicationId));
      await writeAudit(
        database,
        (await requireAdmin()).id,
        "PAYMENT_REJECTED",
        "payment",
        payment.id,
        {
          applicationId: application.id,
          notes: data.notes?.trim() || null,
        },
      );
      return { ok: true, status: "REJECTED" as const };
    }
    if (application.status !== "PAYMENT_PENDING_VERIFICATION")
      throw new Error("Only applications awaiting payment verification can be activated.");
    const selection = await database.query.membershipSelections.findFirst({
      where: eq(membershipSelections.applicationId, application.id),
    });
    if (!selection) throw new Error("Approved membership selection not found.");
    const existingMembership = await database.query.memberships.findFirst({
      where: eq(memberships.applicationId, application.id),
    });
    if (existingMembership)
      throw new Error("An existing membership is already linked to this application.");
    const membershipId = crypto.randomUUID();
    const membershipNumber = `LCM-${new Date().getFullYear()}-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
    const slotValues = Array.from({ length: selection.slotCount }, (_, index) => ({
      id: crypto.randomUUID(),
      membershipId,
      slotNumber: index + 1,
      ruleVersionId: selection.ruleVersionId,
      status: "active",
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    }));
    await database.batch([
      database
        .update(payments)
        .set({
          status: "VERIFIED",
          reviewNotes: data.notes?.trim() || null,
          verifiedAt: now,
          updatedAt: now,
        })
        .where(eq(payments.id, payment.id)),
      database.insert(memberships).values({
        id: membershipId,
        membershipNumber,
        userId: application.userId,
        applicationId: application.id,
        status: "ACTIVE",
        activatedAt: now,
        createdAt: now,
        updatedAt: now,
      }),
      database.insert(membershipSlots).values(slotValues),
      database
        .update(membershipApplications)
        .set({
          status: "ACTIVE",
          updatedAt: now,
        })
        .where(eq(membershipApplications.id, application.id)),
    ]);
    // Create contribution schedule for active membership (Phase 4B activation integration)
    try {
      const scheduleResult = await createContributionScheduleInternal(
        database,
        application.userId,
        membershipId,
      );
      console.log("Contribution schedule created/verified for membership activation", {
        membershipId,
        scheduleId: scheduleResult.schedule.id,
        created: scheduleResult.created,
      });
    } catch (error) {
      console.warn("Contribution schedule creation failed during membership activation:", error);
    }
    await writeAudit(
      database,
      (await requireAdmin()).id,
      "PAYMENT_VERIFIED",
      "payment",
      payment.id,
      {
        applicationId: application.id,
        membershipId,
        membershipNumber,
        notes: data.notes?.trim() || null,
      },
    );
    return { ok: true, status: "VERIFIED" as const, membershipNumber };
  },
);

export const createApplicationDraft = createServerFn({ method: "POST" }).handler(async () => {
  const { user, database, application } = await ownedApplication();
  if (application)
    return {
      id: application.id,
      reference: application.applicationReference,
      status: application.status,
    };
  const profileId = crypto.randomUUID();
  const applicationId = crypto.randomUUID();
  const reference = applicationReference();
  const now = new Date();
  await database.insert(applicantProfiles).values({
    id: profileId,
    userId: user.id,
    firstName: user.name,
    lastName: "",
    idOrPassportNumber: "",
    dateOfBirth: "",
    email: user.email,
    mobileNumber: "",
    residentialAddress: "",
    createdAt: now,
    updatedAt: now,
  });
  await database.insert(membershipApplications).values({
    id: applicationId,
    applicationReference: reference,
    userId: user.id,
    profileId,
    status: "DRAFT",
    createdAt: now,
    updatedAt: now,
  });
  await Promise.all(
    STEP_KEYS.map((stepKey) => markStep(database, applicationId, stepKey, "not_started")),
  );
  return { id: applicationId, reference, status: "DRAFT" };
});

export const saveApplicantProfile = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: Record<string, string> }) => {
    const { user, database, application } = await ownedApplication();
    if (!application || LOCKED_APPLICATION_STATUSES.includes(application.status))
      throw new Error("Application is not editable.");
    await database
      .update(applicantProfiles)
      .set({
        firstName: String(data["firstName"] ?? "").trim(),
        middleName: String(data["middleName"] ?? "").trim() || null,
        lastName: String(data["lastName"] ?? "").trim(),
        idOrPassportNumber: String(data["idOrPassportNumber"] ?? "").trim(),
        dateOfBirth: String(data["dateOfBirth"] ?? ""),
        gender: String(data["gender"] ?? "") || null,
        email: String(data["email"] ?? user.email).trim() || user.email,
        mobileNumber: String(data["mobileNumber"] ?? "").trim(),
        alternativePhone: String(data["alternativePhone"] ?? "").trim() || null,
        residentialAddress: String(data["residentialAddress"] ?? "").trim(),
        country: String(data["country"] ?? "").trim() || null,
        regionOrProvinceState: String(data["regionOrProvinceState"] ?? "").trim() || null,
        districtOrCity: String(data["districtOrCity"] ?? "").trim() || null,
        regionOrDistrict: String(data["regionOrDistrict"] ?? "").trim() || null,
        village: String(data["village"] ?? "").trim() || null,
        chiefOrTraditionalAuthority:
          String(data["chiefOrTraditionalAuthority"] ?? "").trim() || null,
        ward: String(data["ward"] ?? "").trim() || null,
        municipality: String(data["municipality"] ?? "").trim() || null,
        updatedAt: new Date(),
      })
      .where(
        and(eq(applicantProfiles.id, application.profileId), eq(applicantProfiles.userId, user.id)),
      );
    await markStep(database, application.id, "personal", "complete");
    await markStep(database, application.id, "contact", "complete");
    await markStep(database, application.id, "community", "complete");
    return { saved: true };
  },
);

export const saveNextOfKin = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: {
      primary: {
        fullName: string;
        relationship: string;
        mobileNumber: string;
        alternativeNumber?: string;
        address?: string;
      };
      additional?: {
        fullName: string;
        relationship: string;
        mobileNumber: string;
        alternativeNumber?: string;
        address?: string;
      };
    };
  }) => {
    const { database, application } = await ownedApplication();
    if (!application || application.status !== "DRAFT")
      throw new Error("Application is not editable.");
    await database.delete(nextOfKin).where(eq(nextOfKin.applicationId, application.id));
    const now = new Date();
    await database.insert(nextOfKin).values(
      [1, 2].flatMap((priority) => {
        const item = priority === 1 ? data.primary : data.additional;
        return item?.fullName
          ? [
              {
                id: crypto.randomUUID(),
                applicationId: application.id,
                priority,
                fullName: item.fullName.trim(),
                relationship: item.relationship.trim(),
                mobileNumber: item.mobileNumber.trim(),
                alternativeNumber: item.alternativeNumber?.trim() || null,
                address: item.address?.trim() || null,
                createdAt: now,
                updatedAt: now,
              },
            ]
          : [];
      }),
    );
    await markStep(database, application.id, "kin", "complete");
    return { saved: true };
  },
);

export const saveMembershipSelection = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: {
      slotCount: number;
      category: string;
      livestockCount?: number;
      livestockTypes?: string[];
      reasonForJoining: string;
      referralName?: string;
    };
  }) => {
    const { database, application } = await ownedApplication();
    if (!application || application.status !== "DRAFT")
      throw new Error("Application is not editable.");
    if (!Number.isInteger(data.slotCount) || data.slotCount < 1 || data.slotCount > 4)
      throw new Error("Select between one and four slots.");
    const rule = await database.query.membershipRuleVersions.findFirst({
      where: and(
        eq(membershipRuleVersions.slotCount, data.slotCount),
        eq(membershipRuleVersions.status, "active"),
      ),
    });
    if (!rule) throw new Error("Membership rule unavailable.");
    const joiningFeeCents =
      data.slotCount === 3
        ? (await database.query.membershipRuleVersions.findFirst({
            where: and(
              eq(membershipRuleVersions.slotCount, 1),
              eq(membershipRuleVersions.status, "active"),
            ),
          }))!.joiningFeeCents * 2
        : rule.joiningFeeCents;
    const now = new Date();
    const existing = await database.query.membershipSelections.findFirst({
      where: eq(membershipSelections.applicationId, application.id),
    });
    const values = {
      applicationId: application.id,
      ruleVersionId: rule.id,
      slotCount: rule.slotCount,
      shareCount: rule.shareCount,
      joiningFeeCents,
      monthlyContributionCents: rule.monthlyContributionCents,
      updatedAt: now,
    };
    if (existing)
      await database
        .update(membershipSelections)
        .set(values)
        .where(eq(membershipSelections.id, existing.id));
    else
      await database
        .insert(membershipSelections)
        .values({ id: crypto.randomUUID(), ...values, createdAt: now });
    await database
      .update(membershipApplications)
      .set({
        membershipCategory: data.category.trim(),
        livestockCount: data.livestockCount ?? null,
        livestockTypes: data.livestockTypes ?? [],
        reasonForJoining: data.reasonForJoining.trim(),
        referralName: data.referralName?.trim() || null,
        updatedAt: now,
      })
      .where(eq(membershipApplications.id, application.id));
    await markStep(database, application.id, "membership", "complete");
    await markStep(database, application.id, "selection", "complete");
    return { saved: true, rule };
  },
);

export const submitApplication = createServerFn({ method: "POST" }).handler(async () => {
  const { database, application } = await ownedApplication();
  if (!application || application.status !== "DRAFT")
    throw new Error("Only draft applications can be submitted.");
  const profile = await database.query.applicantProfiles.findFirst({
    where: eq(applicantProfiles.id, application.profileId),
  });
  const kin = await database.query.nextOfKin.findFirst({
    where: and(eq(nextOfKin.applicationId, application.id), eq(nextOfKin.priority, 1)),
  });
  const selection = await database.query.membershipSelections.findFirst({
    where: eq(membershipSelections.applicationId, application.id),
  });
  if (
    !profile?.firstName ||
    !profile.lastName ||
    !profile.idOrPassportNumber ||
    !profile.dateOfBirth ||
    !profile.email ||
    !profile.mobileNumber ||
    !profile.residentialAddress ||
    !profile.country ||
    !profile.regionOrProvinceState ||
    !kin ||
    !selection ||
    !application.membershipCategory
  )
    throw new Error("Complete the required application information before submitting.");
  const now = new Date();
  await database
    .update(membershipApplications)
    .set({ status: "PENDING_REVIEW", submittedAt: now, updatedAt: now })
    .where(eq(membershipApplications.id, application.id));
  await markStep(database, application.id, "approval", "PENDING_REVIEW");
  return { reference: application.applicationReference, status: "PENDING_REVIEW" };
});

export const submitPublicApplication = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: {
      firstName: string;
      middleName?: string;
      lastName: string;
      idNumber: string;
      dateOfBirth: string;
      gender?: string;
      email: string;
      phone: string;
      alternativePhone?: string;
      country: string;
      regionOrProvinceState: string;
      districtOrCity?: string;
      address: string;
      village?: string;
      authority?: string;
      ward?: string;
      municipality?: string;
      slotCount: number;
      category: string;
      reason: string;
      primaryName: string;
      primaryRelationship: string;
      primaryPhone: string;
    };
  }) => {
    const user = await requireUser();
    const database = getDatabase();
    const existing = await database.query.membershipApplications.findFirst({
      where: eq(membershipApplications.userId, user.id),
    });
    if (existing) throw new Error("An application already exists for this account.");
    if (!data.firstName.trim() || !data.lastName.trim() || !data.idNumber.trim())
      throw new Error("Complete the required identity information.");
    if (!data.country.trim() || !data.regionOrProvinceState.trim() || !data.address.trim())
      throw new Error("Complete the required residence information.");
    if (!data.primaryName.trim() || !data.primaryRelationship.trim() || !data.primaryPhone.trim())
      throw new Error("Complete the primary next-of-kin information.");
    if (!Number.isInteger(data.slotCount) || data.slotCount < 1 || data.slotCount > 4)
      throw new Error("Select between one and four memberships.");

    const rule = await database.query.membershipRuleVersions.findFirst({
      where: and(
        eq(membershipRuleVersions.slotCount, data.slotCount),
        eq(membershipRuleVersions.status, "active"),
      ),
    });
    if (!rule) throw new Error("Membership rule unavailable.");
    const oneMembershipRule = await database.query.membershipRuleVersions.findFirst({
      where: and(
        eq(membershipRuleVersions.slotCount, 1),
        eq(membershipRuleVersions.status, "active"),
      ),
    });
    if (!oneMembershipRule) throw new Error("Membership rule unavailable.");
    const joiningFeeCents =
      data.slotCount === 3 ? oneMembershipRule.joiningFeeCents * 2 : rule.joiningFeeCents;
    const now = new Date();
    const profileId = crypto.randomUUID();
    const applicationId = crypto.randomUUID();
    const reference = applicationReference();
    await database.insert(applicantProfiles).values({
      id: profileId,
      userId: user.id,
      firstName: data.firstName.trim(),
      middleName: data.middleName?.trim() || null,
      lastName: data.lastName.trim(),
      idOrPassportNumber: data.idNumber.trim(),
      dateOfBirth: data.dateOfBirth,
      gender: data.gender?.trim() || null,
      email: data.email.trim(),
      mobileNumber: data.phone.trim(),
      alternativePhone: data.alternativePhone?.trim() || null,
      residentialAddress: data.address.trim(),
      country: data.country.trim(),
      regionOrProvinceState: data.regionOrProvinceState.trim(),
      districtOrCity: data.districtOrCity?.trim() || null,
      village: data.village?.trim() || null,
      chiefOrTraditionalAuthority: data.authority?.trim() || null,
      ward: data.ward?.trim() || null,
      municipality: data.municipality?.trim() || null,
      createdAt: now,
      updatedAt: now,
    });
    await database.insert(membershipApplications).values({
      id: applicationId,
      applicationReference: reference,
      userId: user.id,
      profileId,
      status: "PENDING_REVIEW",
      membershipCategory: data.category.trim(),
      reasonForJoining: data.reason.trim(),
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    await database.insert(membershipSelections).values({
      id: crypto.randomUUID(),
      applicationId,
      ruleVersionId: rule.id,
      slotCount: rule.slotCount,
      shareCount: rule.shareCount,
      joiningFeeCents,
      monthlyContributionCents: rule.monthlyContributionCents,
      createdAt: now,
      updatedAt: now,
    });
    await database.insert(nextOfKin).values({
      id: crypto.randomUUID(),
      applicationId,
      priority: 1,
      fullName: data.primaryName.trim(),
      relationship: data.primaryRelationship.trim(),
      mobileNumber: data.primaryPhone.trim(),
      createdAt: now,
      updatedAt: now,
    });
    await Promise.all(
      STEP_KEYS.map((stepKey) => markStep(database, applicationId, stepKey, "complete")),
    );
    return { reference, status: "PENDING_REVIEW" as const };
  },
);
