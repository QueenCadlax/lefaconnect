UPDATE `membership_application` SET `status` = 'DRAFT' WHERE `status` IN ('draft', 'incomplete');
--> statement-breakpoint
UPDATE `membership_application` SET `status` = 'PENDING_REVIEW' WHERE `status` IN ('submitted', 'under_review');
--> statement-breakpoint
UPDATE `membership_application` SET `status` = 'APPROVED_PENDING_PAYMENT' WHERE `status` = 'approved';
--> statement-breakpoint
UPDATE `membership_application` SET `status` = 'REJECTED' WHERE `status` = 'rejected';
