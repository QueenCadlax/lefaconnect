import { execFileSync } from "node:child_process";
import { mkdtempSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const persistTo = ".wrangler/local-db/v3";

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

let memberId;
let adminId;
const profileId = "stage6a_applicant_profile";
const applicationId = "stage6a_membership_application";
const ruleVersionId = "stage6a_rule_version";
const selectionId = "stage6a_membership_selection";
const membershipId = "stage6a_membership";
const scheduleId = "stage6a_contribution_schedule";
const periodCurrentId = "stage6a_period_current";
const periodPastId = "stage6a_period_past";
const periodFutureId = "stage6a_period_future";
const freshApplicantProfileId = "uat_fresh_applicant_profile";
const freshApplicantApplicationId = "uat_fresh_applicant_application";

const pendingPaymentId = "stage6a_payment_pending";
const verifiedPaymentId = "stage6a_payment_verified";
const rejectedPaymentId = "stage6a_payment_rejected";
const testPassword = "Stage6A-local-password-123!";
const adminEmail = "stage6a.admin@example.test";
const adminPassword = "Qcadlax-2026!";
const freshApplicantEmail = "uat.fresh.applicant@example.test";
const freshApplicantPassword = "UAT-FreshApplicant-2026!";

const localAuthUrl = process.env.STAGE6A_AUTH_URL ?? "http://127.0.0.1:8787";

execFileSync(process.execPath, [join(root, "scripts", "stage6a-local-cleanup.mjs")], {
  stdio: "inherit",
});

async function createRuntimeUser(email, name, password) {
  const response = await fetch(`${localAuthUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: localAuthUrl,
      referer: `${localAuthUrl}/login`,
    },
    body: JSON.stringify({ name, email, password }),
  });
  const result = await response.json();
  if (response.ok && result.user?.id) return result.user.id;
  const login = await fetch(`${localAuthUrl}/api/auth/sign-in/email`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: localAuthUrl,
      referer: `${localAuthUrl}/login`,
    },
    body: JSON.stringify({ email, password }),
  });
  const loginResult = await login.json();
  if (!login.ok || !loginResult.user?.id) {
    throw new Error(
      `Better Auth account recovery failed for ${email}: ${JSON.stringify(loginResult)}`,
    );
  }
  return loginResult.user.id;
}

memberId = await createRuntimeUser("stage6a.member@example.test", "Stage6A Member", testPassword);
adminId = await createRuntimeUser(adminEmail, "Lefa UAT Administrator", adminPassword);
const freshApplicantId = await createRuntimeUser(
  freshApplicantEmail,
  "UAT Fresh Applicant",
  freshApplicantPassword,
);

const sql = `
DELETE FROM audit_log WHERE actor_user_id IN ('${memberId}', '${adminId}');
DELETE FROM application_step WHERE application_id = '${freshApplicantApplicationId}';
DELETE FROM membership_application WHERE id = '${freshApplicantApplicationId}';
DELETE FROM applicant_profile WHERE id = '${freshApplicantProfileId}';
DELETE FROM contribution_payment WHERE membership_id = '${membershipId}' OR idempotency_key LIKE 'STAGE6A-%';
DELETE FROM contribution_period WHERE membership_id = '${membershipId}';
DELETE FROM contribution_schedule WHERE membership_id = '${membershipId}';
DELETE FROM membership_slot WHERE membership_id = '${membershipId}';
DELETE FROM membership WHERE membership_number = 'LC-TEST6A-0001';
DELETE FROM application_step WHERE application_id = '${applicationId}';
DELETE FROM next_of_kin WHERE application_id = '${applicationId}';
DELETE FROM referral WHERE referred_application_id = '${applicationId}';
DELETE FROM payment WHERE application_id = '${applicationId}';
DELETE FROM membership_selection WHERE id = '${selectionId}';
DELETE FROM membership_rule_version WHERE id = '${ruleVersionId}';
DELETE FROM membership_application WHERE id = '${applicationId}';
DELETE FROM applicant_profile WHERE id = '${profileId}';
DELETE FROM session WHERE token IN ('stage6a-member-session', 'stage6a-admin-session');
UPDATE user SET status = 'admin' WHERE id = '${adminId}';

INSERT INTO applicant_profile (
  id, user_id, first_name, middle_name, last_name, id_or_passport_number, date_of_birth,
  gender, email, mobile_number, alternative_phone, residential_address, country,
  region_or_province_state, district_or_city, region_or_district, village,
  chief_or_traditional_authority, ward, municipality, created_at, updated_at
)
VALUES (
  '${freshApplicantProfileId}', '${freshApplicantId}', 'UAT', 'Fresh', 'Applicant', '', '',
  NULL, '${freshApplicantEmail}', '', NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ${now}, ${now}
);

INSERT INTO membership_application (
  id, application_reference, user_id, profile_id, status, membership_category, livestock_count,
  livestock_types, reason_for_joining, referral_name, submitted_at, created_at, updated_at
)
VALUES (
  '${freshApplicantApplicationId}', 'UAT-FRESH-0001', '${freshApplicantId}', '${freshApplicantProfileId}', 'DRAFT', NULL, NULL,
  '[]', NULL, NULL, NULL, ${now}, ${now}
);

INSERT INTO application_step (id, application_id, step_key, status, completed_at, created_at, updated_at)
VALUES
  ('uat_fresh_step_personal', '${freshApplicantApplicationId}', 'personal', 'not_started', NULL, ${now}, ${now}),
  ('uat_fresh_step_contact', '${freshApplicantApplicationId}', 'contact', 'not_started', NULL, ${now}, ${now}),
  ('uat_fresh_step_community', '${freshApplicantApplicationId}', 'community', 'not_started', NULL, ${now}, ${now}),
  ('uat_fresh_step_kin', '${freshApplicantApplicationId}', 'kin', 'not_started', NULL, ${now}, ${now}),
  ('uat_fresh_step_membership', '${freshApplicantApplicationId}', 'membership', 'not_started', NULL, ${now}, ${now}),
  ('uat_fresh_step_documents', '${freshApplicantApplicationId}', 'documents', 'not_started', NULL, ${now}, ${now}),
  ('uat_fresh_step_selection', '${freshApplicantApplicationId}', 'selection', 'not_started', NULL, ${now}, ${now}),
  ('uat_fresh_step_agreement', '${freshApplicantApplicationId}', 'agreement', 'not_started', NULL, ${now}, ${now}),
  ('uat_fresh_step_payment', '${freshApplicantApplicationId}', 'payment', 'not_started', NULL, ${now}, ${now}),
  ('uat_fresh_step_approval', '${freshApplicantApplicationId}', 'approval', 'not_started', NULL, ${now}, ${now});

INSERT INTO applicant_profile (
  id, user_id, first_name, middle_name, last_name, id_or_passport_number, date_of_birth,
  gender, email, mobile_number, alternative_phone, residential_address, country,
  region_or_province_state, district_or_city, region_or_district, village,
  chief_or_traditional_authority, ward, municipality, created_at, updated_at
)
VALUES (
  '${profileId}', '${memberId}', 'Stage6A', 'Auto', 'Member', 'STAGE6A-1001', '1990-01-15',
  'male', 'stage6a.member@example.test', '+27123456789', NULL, '1 Test Street, Mbombela', 'South Africa',
  'Mpumalanga', 'Mbombela', 'Mbombela', 'Kanyamazane', NULL, 'Test Ward', 'Mbombela', ${now}, ${now}
);

INSERT INTO membership_application (
  id, application_reference, user_id, profile_id, status, membership_category, livestock_count,
  livestock_types, reason_for_joining, referral_name, submitted_at, created_at, updated_at
)
VALUES (
  '${applicationId}', 'APP-TEST6A-0001', '${memberId}', '${profileId}', 'ACTIVE', 'FARMER', 12,
  '[]', 'Stage6A recurring contribution validation member.', 'Test Referrer', ${now}, ${now}, ${now}
);

INSERT INTO membership_rule_version (
  id, version, slot_count, share_count, joining_fee_cents, monthly_contribution_cents,
  effective_from, effective_to, status, created_at, updated_at
)
VALUES (
  '${ruleVersionId}', 'stage6a-v1', 2, 20, 500000, 100000,
  ${now - 365 * day}, NULL, 'active', ${now}, ${now}
);

INSERT INTO membership_selection (
  id, application_id, rule_version_id, slot_count, share_count, joining_fee_cents,
  monthly_contribution_cents, created_at, updated_at
)
VALUES (
  '${selectionId}', '${applicationId}', '${ruleVersionId}', 2, 20, 500000, 100000,
  ${now}, ${now}
);

INSERT INTO membership (
  id, membership_number, user_id, application_id, status, activated_at, created_at, updated_at
)
VALUES (
  '${membershipId}', 'LC-TEST6A-0001', '${memberId}', '${applicationId}', 'ACTIVE', ${now - 90 * day}, ${now}, ${now}
);

INSERT INTO membership_slot (
  id, membership_id, slot_number, rule_version_id, status, approved_at, created_at, updated_at
)
VALUES
  ('stage6a_slot_1', '${membershipId}', 1, '${ruleVersionId}', 'active', ${now}, ${now}, ${now}),
  ('stage6a_slot_2', '${membershipId}', 2, '${ruleVersionId}', 'active', ${now}, ${now}, ${now});

INSERT INTO contribution_schedule (
  id, membership_id, user_id, rule_version_id, monthly_amount_cents, currency, timezone,
  start_date, due_day, status, status_reason, status_changed_at, status_changed_by_user_id,
  created_at, updated_at
)
VALUES (
  '${scheduleId}', '${membershipId}', '${memberId}', '${ruleVersionId}', 100000, 'ZAR', 'Africa/Johannesburg',
  '2026-01-01', 1, 'ACTIVE', NULL, ${now}, '${adminId}', ${now}, ${now}
);

INSERT INTO contribution_period (
  id, schedule_id, membership_id, period_year, period_month, period_start, period_end,
  due_date, amount_due_cents, amount_paid_cents, balance_cents, overpayment_cents,
  credit_applied_cents, status, waived_reason, cancelled_reason, created_at, updated_at
)
VALUES
  ('${periodPastId}', '${scheduleId}', '${membershipId}', 2026, 7, '2026-07-01', '2026-07-31', '2026-07-01', 100000, 100000, 0, 0, 0, 'PAID', NULL, NULL, ${now}, ${now}),
  ('${periodCurrentId}', '${scheduleId}', '${membershipId}', 2026, 8, '2026-08-01', '2026-08-31', '2026-08-01', 100000, 0, 100000, 0, 0, 'UPCOMING', NULL, NULL, ${now}, ${now}),
  ('${periodFutureId}', '${scheduleId}', '${membershipId}', 2026, 9, '2026-09-01', '2026-09-30', '2026-09-01', 100000, 0, 100000, 0, 0, 'UPCOMING', NULL, NULL, ${now}, ${now});

INSERT INTO payment (
  id, application_id, user_id, payment_type, amount_due_cents, amount_paid_cents,
  payment_reference, payment_date, status, pop_file_name, pop_mime_type, pop_size_bytes,
  pop_storage_key, pop_data_base64, review_notes, submitted_at, verified_at, created_at, updated_at
)
VALUES (
  'stage6a_joining_payment', '${applicationId}', '${memberId}', 'JOINING_FEE', 500000, 500000,
  'STAGE6A-JOINING-VERIFIED', '2026-07-01', 'VERIFIED', 'stage6a-joining-pop.png', 'image/png', 68,
  'proof-of-payment/stage6a_membership/joining/stage6a-joining-pop.png', 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'UAT verified joining payment', ${now}, ${now}, ${now}, ${now}
);

INSERT INTO contribution_payment (
  id, contribution_period_id, membership_id, user_id, amount_submitted_cents, amount_verified_cents,
  payment_reference, payment_date, status, pop_file_name, pop_mime_type, pop_size_bytes,
  pop_storage_key, submitted_at, verified_at, verified_by_user_id, review_notes,
  idempotency_key, created_at, updated_at
)
VALUES
  ('${pendingPaymentId}', '${periodCurrentId}', '${membershipId}', '${memberId}', 100000, 0, 'STAGE6A-PENDING-01', '2026-08-05', 'PENDING_VERIFICATION', 'stage6a-pop-pending.png', 'image/png', 1024, 'proof-of-payment/${membershipId}/${periodCurrentId}/stage6a-pop-pending.png', ${now}, NULL, NULL, NULL, 'STAGE6A-IDEMPOTENCY-PENDING', ${now}, ${now}),
  ('${verifiedPaymentId}', '${periodPastId}', '${membershipId}', '${memberId}', 100000, 100000, 'STAGE6A-VERIFIED-01', '2026-07-09', 'VERIFIED', 'stage6a-pop-verified.png', 'image/png', 1024, 'proof-of-payment/${membershipId}/${periodPastId}/stage6a-pop-verified.png', ${now - 2 * day}, ${now - 2 * day}, '${adminId}', 'Verified contribution for Stage6A validation.', 'STAGE6A-IDEMPOTENCY-VERIFIED', ${now}, ${now}),
  ('${rejectedPaymentId}', '${periodCurrentId}', '${membershipId}', '${memberId}', 100000, 0, 'STAGE6A-REJECTED-01', '2026-08-08', 'REJECTED', 'stage6a-pop-rejected.png', 'image/png', 1024, 'proof-of-payment/${membershipId}/${periodCurrentId}/stage6a-pop-rejected.png', ${now - 3 * day}, NULL, NULL, 'Not enough verification detail provided.', 'STAGE6A-IDEMPOTENCY-REJECTED', ${now}, ${now});

INSERT INTO audit_log (id, actor_user_id, action, entity_type, entity_id, metadata, created_at)
VALUES
  ('stage6a_audit_1', '${memberId}', 'CONTRIBUTION_PAYMENT_SUBMITTED', 'contribution_payment', '${pendingPaymentId}', '{"test":"STAGE6A","period":"2026-08"}', ${now}),
  ('stage6a_audit_2', '${adminId}', 'CONTRIBUTION_PAYMENT_VERIFIED', 'contribution_payment', '${verifiedPaymentId}', '{"test":"STAGE6A","period":"2026-07"}', ${now});
`;

const sqlFile = join(mkdtempSync(join(tmpdir(), "lefa-stage6a-")), "stage6a-bootstrap.sql");
writeFileSync(sqlFile, `${sql.trim()}\n`, "utf8");
const popDirectory = mkdtempSync(join(tmpdir(), "lefa-stage6a-pop-"));
const popFile = join(popDirectory, "stage6a-pop.png");
writeFileSync(
  popFile,
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  ),
);

try {
  execFileSync(
    process.env.ComSpec ?? "sh",
    [
      "/d",
      "/s",
      "/c",
      `npx --yes wrangler@4.127.0 d1 execute lefa-connect-db --local --persist-to ${persistTo} --config wrangler.jsonc --file ${sqlFile}`,
    ],
    { stdio: "inherit" },
  );

  console.log("\nStage 6A local bootstrap created successfully.");
  console.log("Tagged records:");
  console.log(`  member: ${memberId} / ${memberId} / stage6a.member@example.test`);
  console.log(`  admin: ${adminId} / ${adminEmail}`);
  console.log(`  fresh applicant: ${freshApplicantId} / ${freshApplicantEmail}`);
  console.log(`  application: ${applicationId} / APP-TEST6A-0001`);
  console.log(`  membership: ${membershipId} / LC-TEST6A-0001`);
  console.log(`  schedule: ${scheduleId}`);
  console.log(`  periods: ${periodPastId}, ${periodCurrentId}, ${periodFutureId}`);
  console.log(`  payments: ${pendingPaymentId}, ${verifiedPaymentId}, ${rejectedPaymentId}`);
  console.log(`\nCleanup command: npm run test:stage6a:cleanup`);
} finally {
  unlinkSync(sqlFile);
}
