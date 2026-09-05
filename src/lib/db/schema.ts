import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
};

export const users = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
    image: text("image"),
    status: text("status").notNull().default("created"),
    ...timestamps,
  },
  (table) => ({ emailIdx: uniqueIndex("user_email_idx").on(table.email) }),
);

export const sessions = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => ({ tokenIdx: uniqueIndex("session_token_idx").on(table.token) }),
);

export const accounts = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  issuer: text("issuer"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
  scope: text("scope"),
  password: text("password"),
  ...timestamps,
});

export const verifications = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  ...timestamps,
});

export const applicantProfiles = sqliteTable(
  "applicant_profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    lastName: text("last_name").notNull(),
    idOrPassportNumber: text("id_or_passport_number").notNull(),
    dateOfBirth: text("date_of_birth").notNull(),
    gender: text("gender"),
    email: text("email").notNull(),
    mobileNumber: text("mobile_number").notNull(),
    alternativePhone: text("alternative_phone"),
    residentialAddress: text("residential_address").notNull(),
    country: text("country"),
    regionOrProvinceState: text("region_or_province_state"),
    districtOrCity: text("district_or_city"),
    regionOrDistrict: text("region_or_district"),
    village: text("village"),
    chiefOrTraditionalAuthority: text("chief_or_traditional_authority"),
    ward: text("ward"),
    municipality: text("municipality"),
    ...timestamps,
  },
  (table) => ({ userIdx: uniqueIndex("applicant_profile_user_idx").on(table.userId) }),
);

export const membershipApplications = sqliteTable(
  "membership_application",
  {
    id: text("id").primaryKey(),
    applicationReference: text("application_reference").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    profileId: text("profile_id")
      .notNull()
      .references(() => applicantProfiles.id),
    status: text("status").notNull().default("DRAFT"),
    membershipCategory: text("membership_category"),
    livestockCount: integer("livestock_count"),
    livestockTypes: text("livestock_types", { mode: "json" }).$type<string[]>(),
    reasonForJoining: text("reason_for_joining"),
    referralName: text("referral_name"),
    submittedAt: integer("submitted_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => ({
    referenceIdx: uniqueIndex("membership_application_reference_idx").on(
      table.applicationReference,
    ),
  }),
);

export const applicationSteps = sqliteTable(
  "application_step",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => membershipApplications.id, { onDelete: "cascade" }),
    stepKey: text("step_key").notNull(),
    status: text("status").notNull().default("not_started"),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => ({
    stepIdx: uniqueIndex("application_step_idx").on(table.applicationId, table.stepKey),
  }),
);

export const nextOfKin = sqliteTable("next_of_kin", {
  id: text("id").primaryKey(),
  applicationId: text("application_id")
    .notNull()
    .references(() => membershipApplications.id, { onDelete: "cascade" }),
  priority: integer("priority").notNull(),
  fullName: text("full_name").notNull(),
  relationship: text("relationship").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  alternativeNumber: text("alternative_number"),
  address: text("address"),
  ...timestamps,
});

export const membershipRuleVersions = sqliteTable(
  "membership_rule_version",
  {
    id: text("id").primaryKey(),
    version: text("version").notNull(),
    slotCount: integer("slot_count").notNull(),
    shareCount: integer("share_count").notNull(),
    joiningFeeCents: integer("joining_fee_cents").notNull(),
    monthlyContributionCents: integer("monthly_contribution_cents").notNull(),
    effectiveFrom: integer("effective_from", { mode: "timestamp_ms" }).notNull(),
    effectiveTo: integer("effective_to", { mode: "timestamp_ms" }),
    status: text("status").notNull().default("active"),
    ...timestamps,
  },
  (table) => ({
    slotVersionIdx: uniqueIndex("membership_rule_slot_version_idx").on(
      table.version,
      table.slotCount,
    ),
  }),
);

export const memberships = sqliteTable(
  "membership",
  {
    id: text("id").primaryKey(),
    membershipNumber: text("membership_number").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    applicationId: text("application_id")
      .notNull()
      .references(() => membershipApplications.id),
    status: text("status").notNull().default("pending_activation"),
    activatedAt: integer("activated_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => ({
    numberIdx: uniqueIndex("membership_number_idx").on(table.membershipNumber),
    applicationIdx: uniqueIndex("membership_application_idx").on(table.applicationId),
  }),
);

export const membershipSlots = sqliteTable(
  "membership_slot",
  {
    id: text("id").primaryKey(),
    membershipId: text("membership_id")
      .notNull()
      .references(() => memberships.id, { onDelete: "cascade" }),
    slotNumber: integer("slot_number").notNull(),
    ruleVersionId: text("rule_version_id")
      .notNull()
      .references(() => membershipRuleVersions.id),
    status: text("status").notNull().default("pending"),
    approvedAt: integer("approved_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => ({
    slotIdx: uniqueIndex("membership_slot_number_idx").on(table.membershipId, table.slotNumber),
  }),
);

export const membershipSelections = sqliteTable(
  "membership_selection",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => membershipApplications.id, { onDelete: "cascade" }),
    ruleVersionId: text("rule_version_id")
      .notNull()
      .references(() => membershipRuleVersions.id),
    slotCount: integer("slot_count").notNull(),
    shareCount: integer("share_count").notNull(),
    joiningFeeCents: integer("joining_fee_cents").notNull(),
    monthlyContributionCents: integer("monthly_contribution_cents").notNull(),
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  },
  (table) => ({
    applicationIdx: uniqueIndex("membership_selection_application_idx").on(table.applicationId),
  }),
);

export const payments = sqliteTable(
  "payment",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => membershipApplications.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    paymentType: text("payment_type").notNull().default("JOINING_FEE"),
    amountDueCents: integer("amount_due_cents").notNull(),
    amountPaidCents: integer("amount_paid_cents").notNull(),
    paymentReference: text("payment_reference").notNull(),
    paymentDate: text("payment_date").notNull(),
    status: text("status").notNull().default("PENDING_VERIFICATION"),
    popFileName: text("pop_file_name").notNull(),
    popMimeType: text("pop_mime_type").notNull(),
    popSizeBytes: integer("pop_size_bytes").notNull(),
    popStorageKey: text("pop_storage_key").notNull(),
    popDataBase64: text("pop_data_base64").notNull(),
    reviewNotes: text("review_notes"),
    submittedAt: integer("submitted_at", { mode: "timestamp_ms" }).notNull(),
    verifiedAt: integer("verified_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => ({ applicationIdx: uniqueIndex("payment_application_idx").on(table.applicationId) }),
);

export const contributionSchedules = sqliteTable(
  "contribution_schedule",
  {
    id: text("id").primaryKey(),
    membershipId: text("membership_id")
      .notNull()
      .references(() => memberships.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    ruleVersionId: text("rule_version_id")
      .notNull()
      .references(() => membershipRuleVersions.id),
    monthlyAmountCents: integer("monthly_amount_cents").notNull(),
    currency: text("currency").notNull().default("ZAR"),
    timezone: text("timezone").notNull().default("Africa/Johannesburg"),
    startDate: text("start_date").notNull(),
    dueDay: integer("due_day").notNull().default(1),
    status: text("status").notNull().default("ACTIVE"),
    statusReason: text("status_reason"),
    statusChangedAt: integer("status_changed_at", { mode: "timestamp_ms" }),
    statusChangedByUserId: text("status_changed_by_user_id").references(() => users.id),
    ...timestamps,
  },
  (table) => ({
    membershipIdx: uniqueIndex("contribution_schedule_membership_idx").on(table.membershipId),
    userStatusIdx: index("contribution_schedule_user_status_idx").on(table.userId, table.status),
  }),
);

export const contributionPeriods = sqliteTable(
  "contribution_period",
  {
    id: text("id").primaryKey(),
    scheduleId: text("schedule_id")
      .notNull()
      .references(() => contributionSchedules.id, { onDelete: "cascade" }),
    membershipId: text("membership_id")
      .notNull()
      .references(() => memberships.id, { onDelete: "cascade" }),
    periodYear: integer("period_year").notNull(),
    periodMonth: integer("period_month").notNull(),
    periodStart: text("period_start").notNull(),
    periodEnd: text("period_end").notNull(),
    dueDate: text("due_date").notNull(),
    amountDueCents: integer("amount_due_cents").notNull(),
    amountPaidCents: integer("amount_paid_cents").notNull().default(0),
    balanceCents: integer("balance_cents").notNull(),
    overpaymentCents: integer("overpayment_cents").notNull().default(0),
    creditAppliedCents: integer("credit_applied_cents").notNull().default(0),
    status: text("status").notNull().default("UPCOMING"),
    waivedReason: text("waived_reason"),
    cancelledReason: text("cancelled_reason"),
    ...timestamps,
  },
  (table) => ({
    periodIdx: uniqueIndex("contribution_period_membership_period_idx").on(
      table.membershipId,
      table.periodYear,
      table.periodMonth,
    ),
    membershipStatusIdx: index("contribution_period_membership_status_idx").on(
      table.membershipId,
      table.status,
    ),
  }),
);

export const contributionPayments = sqliteTable(
  "contribution_payment",
  {
    id: text("id").primaryKey(),
    contributionPeriodId: text("contribution_period_id")
      .notNull()
      .references(() => contributionPeriods.id, { onDelete: "cascade" }),
    membershipId: text("membership_id")
      .notNull()
      .references(() => memberships.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    amountSubmittedCents: integer("amount_submitted_cents").notNull(),
    amountVerifiedCents: integer("amount_verified_cents").notNull().default(0),
    paymentReference: text("payment_reference").notNull(),
    paymentDate: text("payment_date").notNull(),
    status: text("status").notNull().default("PENDING_VERIFICATION"),
    popFileName: text("pop_file_name").notNull(),
    popMimeType: text("pop_mime_type").notNull(),
    popSizeBytes: integer("pop_size_bytes").notNull(),
    popStorageKey: text("pop_storage_key").notNull(),
    submittedAt: integer("submitted_at", { mode: "timestamp_ms" }).notNull(),
    verifiedAt: integer("verified_at", { mode: "timestamp_ms" }),
    verifiedByUserId: text("verified_by_user_id").references(() => users.id),
    reviewNotes: text("review_notes"),
    idempotencyKey: text("idempotency_key").notNull(),
    ...timestamps,
  },
  (table) => ({
    idempotencyIdx: uniqueIndex("contribution_payment_user_idempotency_idx").on(
      table.userId,
      table.idempotencyKey,
    ),
    periodIdx: index("contribution_payment_period_idx").on(table.contributionPeriodId),
  }),
);

export const contributionCredits = sqliteTable(
  "contribution_credit",
  {
    id: text("id").primaryKey(),
    membershipId: text("membership_id")
      .notNull()
      .references(() => memberships.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    sourcePaymentId: text("source_payment_id").references(() => contributionPayments.id),
    sourcePeriodId: text("source_period_id").references(() => contributionPeriods.id),
    amountCents: integer("amount_cents").notNull(),
    remainingCents: integer("remaining_cents").notNull(),
    kind: text("kind").notNull().default("OVERPAYMENT"),
    reason: text("reason").notNull(),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  },
  (table) => ({
    sourcePaymentIdx: uniqueIndex("contribution_credit_source_payment_idx").on(
      table.sourcePaymentId,
    ),
    membershipIdx: index("contribution_credit_membership_idx").on(
      table.membershipId,
      table.remainingCents,
    ),
  }),
);

export const referrals = sqliteTable("referral", {
  id: text("id").primaryKey(),
  referrerUserId: text("referrer_user_id").references(() => users.id),
  referredApplicationId: text("referred_application_id")
    .notNull()
    .references(() => membershipApplications.id),
  referralCode: text("referral_code"),
  status: text("status").notNull().default("captured"),
  rewardAmountCents: integer("reward_amount_cents"),
  ...timestamps,
});

export const auditLogs = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actorUserId: text("actor_user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: timestamps.createdAt,
});

export const announcements = sqliteTable(
  "announcement",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    audience: text("audience").notNull().default("ALL_MEMBERS"),
    status: text("status").notNull().default("PUBLISHED"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    archivedAt: integer("archived_at", { mode: "timestamp_ms" }),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => users.id),
    ...timestamps,
  },
  (table) => ({ statusIdx: index("announcement_status_idx").on(table.status, table.publishedAt) }),
);

export const announcementRecipients = sqliteTable(
  "announcement_recipient",
  {
    id: text("id").primaryKey(),
    announcementId: text("announcement_id")
      .notNull()
      .references(() => announcements.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    readAt: integer("read_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => ({
    recipientIdx: uniqueIndex("announcement_recipient_idx").on(table.announcementId, table.userId),
  }),
);

export const conversations = sqliteTable(
  "conversation",
  {
    id: text("id").primaryKey(),
    memberUserId: text("member_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => users.id),
    status: text("status").notNull().default("OPEN"),
    ...timestamps,
  },
  (table) => ({ memberIdx: uniqueIndex("conversation_member_idx").on(table.memberUserId) }),
);

export const messages = sqliteTable(
  "message",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderUserId: text("sender_user_id")
      .notNull()
      .references(() => users.id),
    recipientUserId: text("recipient_user_id")
      .notNull()
      .references(() => users.id),
    kind: text("kind").notNull().default("TEXT"),
    content: text("content"),
    storageKey: text("storage_key"),
    mimeType: text("mime_type"),
    durationSeconds: integer("duration_seconds"),
    readAt: integer("read_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => ({
    conversationIdx: index("message_conversation_idx").on(table.conversationId, table.createdAt),
  }),
);

export const notifications = sqliteTable(
  "notification",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    readAt: integer("read_at", { mode: "timestamp_ms" }),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("notification_user_idx").on(table.userId, table.readAt, table.createdAt),
  }),
);

export const allTables = {
  users,
  sessions,
  accounts,
  verifications,
  applicantProfiles,
  membershipApplications,
  applicationSteps,
  nextOfKin,
  membershipRuleVersions,
  memberships,
  membershipSlots,
  membershipSelections,
  payments,
  contributionSchedules,
  contributionPeriods,
  contributionPayments,
  contributionCredits,
  referrals,
  auditLogs,
  announcements,
  announcementRecipients,
  conversations,
  messages,
  notifications,
};
