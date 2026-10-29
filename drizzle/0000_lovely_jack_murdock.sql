CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`target` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`version_id` text NOT NULL,
	`number` integer NOT NULL,
	`label` text NOT NULL,
	`content` text NOT NULL,
	`normalized` text NOT NULL,
	FOREIGN KEY (`version_id`) REFERENCES `versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`current_version` text,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'learner' NOT NULL,
	`structure` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`enrollments` text DEFAULT '[]' NOT NULL,
	`assignments` text DEFAULT '[]' NOT NULL,
	`last_seen` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `versions` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_id` text NOT NULL,
	`label` text NOT NULL,
	`filename` text NOT NULL,
	`object_key` text NOT NULL,
	`preview_key` text,
	`format` text NOT NULL,
	`size` integer NOT NULL,
	`sha256` text NOT NULL,
	`created` text NOT NULL,
	`actor` text NOT NULL,
	`indexed` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON UPDATE no action ON DELETE no action
);
