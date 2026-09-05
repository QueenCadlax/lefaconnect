CREATE TABLE `payment` (
  `id` text PRIMARY KEY NOT NULL,
  `application_id` text NOT NULL REFERENCES `membership_application`(`id`) ON DELETE CASCADE,
  `user_id` text NOT NULL REFERENCES `user`(`id`),
  `payment_type` text DEFAULT 'JOINING_FEE' NOT NULL,
  `amount_due_cents` integer NOT NULL,
  `amount_paid_cents` integer NOT NULL,
  `payment_reference` text NOT NULL,
  `payment_date` text NOT NULL,
  `status` text DEFAULT 'PENDING_VERIFICATION' NOT NULL,
  `pop_file_name` text NOT NULL,
  `pop_mime_type` text NOT NULL,
  `pop_size_bytes` integer NOT NULL,
  `pop_storage_key` text NOT NULL,
  `pop_data_base64` text NOT NULL,
  `review_notes` text,
  `submitted_at` integer NOT NULL,
  `verified_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_application_idx` ON `payment` (`application_id`);