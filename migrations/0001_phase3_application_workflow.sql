ALTER TABLE `membership_application` ADD `referral_name` text;
--> statement-breakpoint
CREATE TABLE `application_step` (
  `id` text PRIMARY KEY NOT NULL,
  `application_id` text NOT NULL REFERENCES `membership_application`(`id`) ON DELETE CASCADE,
  `step_key` text NOT NULL,
  `status` text DEFAULT 'not_started' NOT NULL,
  `completed_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `application_step_idx` ON `application_step` (`application_id`, `step_key`);
--> statement-breakpoint
CREATE TABLE `membership_selection` (
  `id` text PRIMARY KEY NOT NULL,
  `application_id` text NOT NULL REFERENCES `membership_application`(`id`) ON DELETE CASCADE,
  `rule_version_id` text NOT NULL REFERENCES `membership_rule_version`(`id`),
  `slot_count` integer NOT NULL,
  `share_count` integer NOT NULL,
  `joining_fee_cents` integer NOT NULL,
  `monthly_contribution_cents` integer NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `membership_selection_application_idx` ON `membership_selection` (`application_id`);
