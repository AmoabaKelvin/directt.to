CREATE TABLE `android_apps` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`user_id` text NOT NULL,
	`package_name` text NOT NULL,
	`sha256_cert_fingerprints` text NOT NULL,
	`store_link` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `api_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`token` text NOT NULL,
	`first_four_chars` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`last_used_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `custom_domains` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`domain` text NOT NULL,
	`challenges` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ios_apps` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`user_id` text NOT NULL,
	`bundle_id` text NOT NULL,
	`team_id` text NOT NULL,
	`store_link` text NOT NULL,
	`created_at` integer DEFAULT '"2024-08-08T00:44:16.647Z"' NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`domain` text NOT NULL,
	`meta_title` text,
	`meta_description` text,
	`meta_image` text,
	`short_url` text NOT NULL,
	`long_url` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer,
	`clicks` integer DEFAULT 0 NOT NULL,
	`android_referrer` text,
	`play_store_redirects` integer DEFAULT 0 NOT NULL,
	`app_store_redirects` integer DEFAULT 0 NOT NULL,
	`general_redirects` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`subdomain` text,
	`custom_domain` text,
	`created_at` integer DEFAULT '"2024-08-08T00:44:16.647Z"' NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`name` text(255),
	`email` text(255),
	`created_links_count` integer DEFAULT 0 NOT NULL,
	`lemonSqueezy_subscription_id` text,
	`lemonSqueezy_price_id` text,
	`lemonSqueezy_customer_id` text,
	`lemonSqueezy_current_period_end` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `android_app_project_id_idx` ON `android_apps` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `api_tokens_token_unique` ON `api_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `api_token_user_idx` ON `api_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `api_token_token_idx` ON `api_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `custom_domain_user_idx` ON `custom_domains` (`user_id`);--> statement-breakpoint
CREATE INDEX `custom_domain_domain_idx` ON `custom_domains` (`domain`);--> statement-breakpoint
CREATE INDEX `ios_app_project_id_idx` ON `ios_apps` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `links_short_url_unique` ON `links` (`short_url`);--> statement-breakpoint
CREATE INDEX `link_project_id_idx` ON `links` (`project_id`);--> statement-breakpoint
CREATE INDEX `link_short_url_idx` ON `links` (`short_url`);--> statement-breakpoint
CREATE INDEX `project_user_idx` ON `projects` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `users` (`id`);--> statement-breakpoint
CREATE INDEX `user_email_idx` ON `users` (`email`);