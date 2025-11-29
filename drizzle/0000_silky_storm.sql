CREATE TABLE `models` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`provider` text NOT NULL,
	`context_window` integer NOT NULL,
	`max_output_tokens` integer,
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `models_name_unique` ON `models` (`name`);--> statement-breakpoint
CREATE TABLE `output_samples` (
	`id` text PRIMARY KEY NOT NULL,
	`version_id` text NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`version_id`) REFERENCES `prompt_versions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prompt_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`prompt_id` text NOT NULL,
	`version_number` integer NOT NULL,
	`label` text,
	`content` text NOT NULL,
	`model_id` text,
	`temperature` real,
	`token_limit` integer,
	`top_k` integer,
	`top_p` real,
	`note` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`prompt_id`) REFERENCES `prompts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`current_content` text DEFAULT '',
	`current_model_id` text,
	`current_temperature` real DEFAULT 0.7,
	`current_token_limit` integer DEFAULT 2000,
	`current_top_k` integer,
	`current_top_p` real,
	`is_favorite` integer DEFAULT false,
	`is_archived` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`current_model_id`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `prompts_to_tags` (
	`prompt_id` text NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`prompt_id`, `tag_id`),
	FOREIGN KEY (`prompt_id`) REFERENCES `prompts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);