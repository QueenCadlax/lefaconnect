-- Deliberate local UAT fixture. This file only seeds tagged test records.
-- Run after migrations with:
-- npx wrangler d1 execute lefa-connect-db --local --persist-to .wrangler/local-db/v3 --config wrangler.jsonc --file scripts/uat-local-seed.sql

UPDATE user SET status = 'admin' WHERE lower(email) = 'qcadlax@gmail.com';

INSERT INTO applicant_profile (id, user_id, first_name, middle_name, last_name, id_or_passport_number, date_of_birth, gender, email, mobile_number, alternative_phone, residential_address, country, region_or_province_state, district_or_city, region_or_district, village, chief_or_traditional_authority, ward, municipality, created_at, updated_at)
SELECT 'uat_fresh_applicant_profile', id, 'UAT', 'Fresh', 'Applicant', '', '', NULL, email, '', NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, unixepoch() * 1000, unixepoch() * 1000
FROM user WHERE lower(email) = 'uat.fresh.applicant@example.test';

INSERT INTO membership_application (id, application_reference, user_id, profile_id, status, membership_category, livestock_count, livestock_types, reason_for_joining, referral_name, submitted_at, created_at, updated_at)
SELECT 'uat_fresh_applicant_application', 'UAT-FRESH-0001', id, 'uat_fresh_applicant_profile', 'DRAFT', NULL, NULL, '[]', NULL, NULL, NULL, unixepoch() * 1000, unixepoch() * 1000
FROM user WHERE lower(email) = 'uat.fresh.applicant@example.test';

INSERT INTO application_step (id, application_id, step_key, status, completed_at, created_at, updated_at) VALUES
('uat_fresh_step_personal', 'uat_fresh_applicant_application', 'personal', 'not_started', NULL, unixepoch() * 1000, unixepoch() * 1000),
('uat_fresh_step_contact', 'uat_fresh_applicant_application', 'contact', 'not_started', NULL, unixepoch() * 1000, unixepoch() * 1000),
('uat_fresh_step_community', 'uat_fresh_applicant_application', 'community', 'not_started', NULL, unixepoch() * 1000, unixepoch() * 1000),
('uat_fresh_step_kin', 'uat_fresh_applicant_application', 'kin', 'not_started', NULL, unixepoch() * 1000, unixepoch() * 1000),
('uat_fresh_step_membership', 'uat_fresh_applicant_application', 'membership', 'not_started', NULL, unixepoch() * 1000, unixepoch() * 1000),
('uat_fresh_step_documents', 'uat_fresh_applicant_application', 'documents', 'not_started', NULL, unixepoch() * 1000, unixepoch() * 1000),
('uat_fresh_step_selection', 'uat_fresh_applicant_application', 'selection', 'not_started', NULL, unixepoch() * 1000, unixepoch() * 1000),
('uat_fresh_step_agreement', 'uat_fresh_applicant_application', 'agreement', 'not_started', NULL, unixepoch() * 1000, unixepoch() * 1000),
('uat_fresh_step_payment', 'uat_fresh_applicant_application', 'payment', 'not_started', NULL, unixepoch() * 1000, unixepoch() * 1000),
('uat_fresh_step_approval', 'uat_fresh_applicant_application', 'approval', 'not_started', NULL, unixepoch() * 1000, unixepoch() * 1000);

INSERT INTO applicant_profile (id, user_id, first_name, middle_name, last_name, id_or_passport_number, date_of_birth, gender, email, mobile_number, alternative_phone, residential_address, country, region_or_province_state, district_or_city, region_or_district, village, chief_or_traditional_authority, ward, municipality, created_at, updated_at)
SELECT 'uat_active_member_profile', id, 'Stage6A', 'UAT', 'Member', 'UAT-ACTIVE-1001', '1990-01-15', 'male', email, '+27123456789', NULL, '1 UAT Test Street', 'South Africa', 'Mpumalanga', 'Mbombela', 'Mbombela', 'Kanyamazane', NULL, 'Test Ward', 'Mbombela', unixepoch() * 1000, unixepoch() * 1000
FROM user WHERE lower(email) = 'stage6a.member@example.test';

INSERT INTO membership_application (id, application_reference, user_id, profile_id, status, membership_category, livestock_count, livestock_types, reason_for_joining, referral_name, submitted_at, created_at, updated_at)
SELECT 'uat_active_member_application', 'UAT-ACTIVE-0001', id, 'uat_active_member_profile', 'ACTIVE', 'FARMER', 12, '["cattle","goats"]', 'Tagged active-member UAT scenario', 'UAT', unixepoch() * 1000, unixepoch() * 1000, unixepoch() * 1000
FROM user WHERE lower(email) = 'stage6a.member@example.test';

INSERT INTO membership_rule_version (id, version, slot_count, share_count, joining_fee_cents, monthly_contribution_cents, effective_from, effective_to, status, created_at, updated_at)
VALUES ('uat_active_rule_version', 'uat-v1', 2, 20, 500000, 100000, unixepoch() * 1000, NULL, 'active', unixepoch() * 1000, unixepoch() * 1000);

INSERT INTO membership_selection (id, application_id, rule_version_id, slot_count, share_count, joining_fee_cents, monthly_contribution_cents, created_at, updated_at)
VALUES ('uat_active_selection', 'uat_active_member_application', 'uat_active_rule_version', 2, 20, 500000, 100000, unixepoch() * 1000, unixepoch() * 1000);

INSERT INTO membership (id, membership_number, user_id, application_id, status, activated_at, created_at, updated_at)
SELECT 'uat_active_membership', 'LC-UAT-0001', id, 'uat_active_member_application', 'ACTIVE', unixepoch() * 1000, unixepoch() * 1000, unixepoch() * 1000
FROM user WHERE lower(email) = 'stage6a.member@example.test';

INSERT INTO membership_slot (id, membership_id, slot_number, rule_version_id, status, approved_at, created_at, updated_at)
VALUES ('uat_active_slot_1', 'uat_active_membership', 1, 'uat_active_rule_version', 'ACTIVE', unixepoch() * 1000, unixepoch() * 1000, unixepoch() * 1000), ('uat_active_slot_2', 'uat_active_membership', 2, 'uat_active_rule_version', 'ACTIVE', unixepoch() * 1000, unixepoch() * 1000, unixepoch() * 1000);

INSERT INTO payment (id, application_id, user_id, payment_type, amount_due_cents, amount_paid_cents, payment_reference, payment_date, status, pop_file_name, pop_mime_type, pop_size_bytes, pop_storage_key, pop_data_base64, review_notes, submitted_at, verified_at, created_at, updated_at)
SELECT 'uat_active_joining_payment', 'uat_active_member_application', id, 'JOINING_FEE', 500000, 500000, 'UAT-JOINING-VERIFIED', '2026-09-01', 'VERIFIED', 'uat-joining-proof.png', 'image/png', 9, 'uat/joining-proof.png', 'iVBORw0KGgo=', 'UAT verified joining payment', unixepoch() * 1000, unixepoch() * 1000, unixepoch() * 1000, unixepoch() * 1000
FROM user WHERE lower(email) = 'stage6a.member@example.test';

INSERT INTO contribution_schedule (id, membership_id, user_id, rule_version_id, monthly_amount_cents, currency, timezone, start_date, due_day, status, status_reason, status_changed_at, status_changed_by_user_id, created_at, updated_at)
SELECT 'uat_active_schedule', 'uat_active_membership', id, 'uat_active_rule_version', 100000, 'ZAR', 'Africa/Johannesburg', '2026-01-01', 1, 'ACTIVE', NULL, unixepoch() * 1000, (SELECT id FROM user WHERE lower(email) = 'qcadlax@gmail.com'), unixepoch() * 1000, unixepoch() * 1000
FROM user WHERE lower(email) = 'stage6a.member@example.test';

INSERT INTO contribution_period (id, schedule_id, membership_id, period_year, period_month, period_start, period_end, due_date, amount_due_cents, amount_paid_cents, balance_cents, overpayment_cents, credit_applied_cents, status, waived_reason, cancelled_reason, created_at, updated_at)
VALUES ('uat_active_period', 'uat_active_schedule', 'uat_active_membership', 2026, 10, '2026-10-01', '2026-10-31', '2026-10-01', 100000, 0, 100000, 0, 0, 'UPCOMING', NULL, NULL, unixepoch() * 1000, unixepoch() * 1000);
