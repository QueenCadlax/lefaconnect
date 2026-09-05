CREATE TABLE `contribution_schedule` (
  `id` text PRIMARY KEY NOT NULL,
  `membership_id` text NOT NULL REFERENCES `membership`(`id`) ON DELETE CASCADE,
  `user_id` text NOT NULL REFERENCES `user`(`id`),
  `rule_version_id` text NOT NULL REFERENCES `membership_rule_version`(`id`),
  `monthly_amount_cents` integer NOT NULL,
  `currency` text DEFAULT 'ZAR' NOT NULL,
  `timezone` text DEFAULT 'Africa/Johannesburg' NOT NULL,
  `start_date` text NOT NULL,
  `due_day` integer DEFAULT 1 NOT NULL,
  `status` text DEFAULT 'ACTIVE' NOT NULL,
  `status_reason` text,
  `status_changed_at` integer,
  `status_changed_by_user_id` text REFERENCES `user`(`id`),
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX `contribution_schedule_membership_idx` ON `contribution_schedule` (`membership_id`);
CREATE INDEX `contribution_schedule_user_status_idx` ON `contribution_schedule` (`user_id`, `status`);
CREATE TABLE `contribution_period` (
  `id` text PRIMARY KEY NOT NULL,
  `schedule_id` text NOT NULL REFERENCES `contribution_schedule`(`id`) ON DELETE CASCADE,
  `membership_id` text NOT NULL REFERENCES `membership`(`id`) ON DELETE CASCADE,
  `period_year` integer NOT NULL,
  `period_month` integer NOT NULL,
  `period_start` text NOT NULL,
  `period_end` text NOT NULL,
  `due_date` text NOT NULL,
  `amount_due_cents` integer NOT NULL,
  `amount_paid_cents` integer DEFAULT 0 NOT NULL,
  `balance_cents` integer NOT NULL,
  `overpayment_cents` integer DEFAULT 0 NOT NULL,
  `status` text DEFAULT 'UPCOMING' NOT NULL,
  `waived_reason` text,
  `cancelled_reason` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX `contribution_period_membership_period_idx` ON `contribution_period` (`membership_id`, `period_year`, `period_month`);
CREATE INDEX `contribution_period_membership_status_idx` ON `contribution_period` (`membership_id`, `status`);
CREATE INDEX `contribution_period_due_date_idx` ON `contribution_period` (`due_date`);
CREATE TABLE `contribution_payment` (
  `id` text PRIMARY KEY NOT NULL,
  `contribution_period_id` text NOT NULL REFERENCES `contribution_period`(`id`) ON DELETE CASCADE,
  `membership_id` text NOT NULL REFERENCES `membership`(`id`) ON DELETE CASCADE,
  `user_id` text NOT NULL REFERENCES `user`(`id`),
  `amount_submitted_cents` integer NOT NULL,
  `amount_verified_cents` integer DEFAULT 0 NOT NULL,
  `payment_reference` text NOT NULL,
  `payment_date` text NOT NULL,
  `status` text DEFAULT 'PENDING_VERIFICATION' NOT NULL,
  `pop_file_name` text NOT NULL,
  `pop_mime_type` text NOT NULL,
  `pop_size_bytes` integer NOT NULL,
  `pop_storage_key` text NOT NULL,
  `submitted_at` integer NOT NULL,
  `verified_at` integer,
  `verified_by_user_id` text REFERENCES `user`(`id`),
  `review_notes` text,
  `idempotency_key` text NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX `contribution_payment_user_idempotency_idx` ON `contribution_payment` (`user_id`, `idempotency_key`);
CREATE INDEX `contribution_payment_period_idx` ON `contribution_payment` (`contribution_period_id`);
CREATE INDEX `contribution_payment_membership_status_idx` ON `contribution_payment` (`membership_id`, `status`);