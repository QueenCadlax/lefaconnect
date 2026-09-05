CREATE TABLE `user` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `email_verified` integer DEFAULT false NOT NULL,
  `image` text,
  `status` text DEFAULT 'created' NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_idx` ON `user` (`email`);
--> statement-breakpoint
CREATE TABLE `session` (
  `id` text PRIMARY KEY NOT NULL,
  `expires_at` integer NOT NULL,
  `token` text NOT NULL,
  `ip_address` text,
  `user_agent` text,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_idx` ON `session` (`token`);
--> statement-breakpoint
CREATE TABLE `account` (
  `id` text PRIMARY KEY NOT NULL,
  `account_id` text NOT NULL,
  `provider_id` text NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `access_token` text,
  `refresh_token` text,
  `id_token` text,
  `access_token_expires_at` integer,
  `refresh_token_expires_at` integer,
  `scope` text,
  `password` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verification` (
  `id` text PRIMARY KEY NOT NULL,
  `identifier` text NOT NULL,
  `value` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `applicant_profile` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`),
  `first_name` text NOT NULL,
  `middle_name` text,
  `last_name` text NOT NULL,
  `id_or_passport_number` text NOT NULL,
  `date_of_birth` text NOT NULL,
  `gender` text,
  `email` text NOT NULL,
  `mobile_number` text NOT NULL,
  `alternative_phone` text,
  `residential_address` text NOT NULL,
  `region_or_district` text,
  `village` text,
  `chief_or_traditional_authority` text,
  `ward` text,
  `municipality` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applicant_profile_user_idx` ON `applicant_profile` (`user_id`);
--> statement-breakpoint
CREATE TABLE `membership_application` (
  `id` text PRIMARY KEY NOT NULL,
  `application_reference` text NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`),
  `profile_id` text NOT NULL REFERENCES `applicant_profile`(`id`),
  `status` text DEFAULT 'incomplete' NOT NULL,
  `membership_category` text,
  `livestock_count` integer,
  `livestock_types` text,
  `reason_for_joining` text,
  `submitted_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `membership_application_reference_idx` ON `membership_application` (`application_reference`);
--> statement-breakpoint
CREATE TABLE `next_of_kin` (
  `id` text PRIMARY KEY NOT NULL,
  `application_id` text NOT NULL REFERENCES `membership_application`(`id`) ON DELETE CASCADE,
  `priority` integer NOT NULL,
  `full_name` text NOT NULL,
  `relationship` text NOT NULL,
  `mobile_number` text NOT NULL,
  `alternative_number` text,
  `address` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `membership_rule_version` (
  `id` text PRIMARY KEY NOT NULL,
  `version` text NOT NULL,
  `slot_count` integer NOT NULL,
  `share_count` integer NOT NULL,
  `joining_fee_cents` integer NOT NULL,
  `monthly_contribution_cents` integer NOT NULL,
  `effective_from` integer NOT NULL,
  `effective_to` integer,
  `status` text DEFAULT 'active' NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `membership_rule_slot_version_idx` ON `membership_rule_version` (`version`, `slot_count`);
--> statement-breakpoint
CREATE TABLE `membership` (
  `id` text PRIMARY KEY NOT NULL,
  `membership_number` text NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`),
  `application_id` text NOT NULL REFERENCES `membership_application`(`id`),
  `status` text DEFAULT 'pending_activation' NOT NULL,
  `activated_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `membership_number_idx` ON `membership` (`membership_number`);
--> statement-breakpoint
CREATE TABLE `membership_slot` (
  `id` text PRIMARY KEY NOT NULL,
  `membership_id` text NOT NULL REFERENCES `membership`(`id`) ON DELETE CASCADE,
  `slot_number` integer NOT NULL,
  `rule_version_id` text NOT NULL REFERENCES `membership_rule_version`(`id`),
  `status` text DEFAULT 'pending' NOT NULL,
  `approved_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `membership_slot_number_idx` ON `membership_slot` (`membership_id`, `slot_number`);
--> statement-breakpoint
CREATE TABLE `referral` (
  `id` text PRIMARY KEY NOT NULL,
  `referrer_user_id` text REFERENCES `user`(`id`),
  `referred_application_id` text NOT NULL REFERENCES `membership_application`(`id`),
  `referral_code` text,
  `status` text DEFAULT 'captured' NOT NULL,
  `reward_amount_cents` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
  `id` text PRIMARY KEY NOT NULL,
  `actor_user_id` text REFERENCES `user`(`id`),
  `action` text NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` text NOT NULL,
  `metadata` text,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `membership_rule_version` (`id`, `version`, `slot_count`, `share_count`, `joining_fee_cents`, `monthly_contribution_cents`, `effective_from`, `status`, `created_at`, `updated_at`) VALUES
('rule-v1-slot-1', 'v1', 1, 10, 250000, 50000, 1787097600000, 'active', 1787097600000, 1787097600000),
('rule-v1-slot-2', 'v1', 2, 20, 500000, 100000, 1787097600000, 'active', 1787097600000, 1787097600000),
('rule-v1-slot-3', 'v1', 3, 30, 750000, 150000, 1787097600000, 'active', 1787097600000, 1787097600000),
('rule-v1-slot-4', 'v1', 4, 40, 750000, 200000, 1787097600000, 'active', 1787097600000, 1787097600000);
