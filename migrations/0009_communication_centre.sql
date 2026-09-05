CREATE TABLE `announcement` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `content` text NOT NULL,
  `audience` text DEFAULT 'ALL_MEMBERS' NOT NULL,
  `status` text DEFAULT 'PUBLISHED' NOT NULL,
  `published_at` integer,
  `archived_at` integer,
  `created_by_user_id` text NOT NULL REFERENCES `user`(`id`),
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE INDEX `announcement_status_idx` ON `announcement` (`status`, `published_at`);
CREATE TABLE `announcement_recipient` (
  `id` text PRIMARY KEY NOT NULL,
  `announcement_id` text NOT NULL REFERENCES `announcement`(`id`) ON DELETE CASCADE,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `read_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX `announcement_recipient_idx` ON `announcement_recipient` (`announcement_id`, `user_id`);
CREATE TABLE `conversation` (
  `id` text PRIMARY KEY NOT NULL,
  `member_user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `admin_user_id` text NOT NULL REFERENCES `user`(`id`),
  `status` text DEFAULT 'OPEN' NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX `conversation_member_idx` ON `conversation` (`member_user_id`);
CREATE TABLE `message` (
  `id` text PRIMARY KEY NOT NULL,
  `conversation_id` text NOT NULL REFERENCES `conversation`(`id`) ON DELETE CASCADE,
  `sender_user_id` text NOT NULL REFERENCES `user`(`id`),
  `recipient_user_id` text NOT NULL REFERENCES `user`(`id`),
  `kind` text DEFAULT 'TEXT' NOT NULL,
  `content` text,
  `storage_key` text,
  `mime_type` text,
  `duration_seconds` integer,
  `read_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE INDEX `message_conversation_idx` ON `message` (`conversation_id`, `created_at`);
CREATE TABLE `notification` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `type` text NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` text NOT NULL,
  `title` text NOT NULL,
  `body` text NOT NULL,
  `read_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE INDEX `notification_user_idx` ON `notification` (`user_id`, `read_at`, `created_at`);