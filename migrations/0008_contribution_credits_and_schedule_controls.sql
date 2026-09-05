ALTER TABLE `contribution_period` ADD COLUMN `credit_applied_cents` integer DEFAULT 0 NOT NULL;

CREATE TABLE `contribution_credit` (
  `id` text PRIMARY KEY NOT NULL,
  `membership_id` text NOT NULL REFERENCES `membership`(`id`) ON DELETE CASCADE,
  `user_id` text NOT NULL REFERENCES `user`(`id`),
  `source_payment_id` text REFERENCES `contribution_payment`(`id`),
  `source_period_id` text REFERENCES `contribution_period`(`id`),
  `amount_cents` integer NOT NULL,
  `remaining_cents` integer NOT NULL,
  `kind` text DEFAULT 'OVERPAYMENT' NOT NULL,
  `reason` text NOT NULL,
  `created_by_user_id` text NOT NULL REFERENCES `user`(`id`),
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX `contribution_credit_source_payment_idx` ON `contribution_credit` (`source_payment_id`);
CREATE INDEX `contribution_credit_membership_idx` ON `contribution_credit` (`membership_id`, `remaining_cents`);