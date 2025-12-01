PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`current_content` text DEFAULT '',
	`current_model_id` text,
	`current_temperature` real DEFAULT 0.7,
	`current_token_limit` integer DEFAULT 2000,
	`current_top_k` integer,
	`current_top_p` real,
	`is_favorite` integer DEFAULT false NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`current_model_id`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_prompts`("id", "name", "description", "current_content", "current_model_id", "current_temperature", "current_token_limit", "current_top_k", "current_top_p", "is_favorite", "is_archived", "created_at", "updated_at") SELECT "id", "name", "description", "current_content", "current_model_id", "current_temperature", "current_token_limit", "current_top_k", "current_top_p", "is_favorite", "is_archived", "created_at", "updated_at" FROM `prompts`;--> statement-breakpoint
DROP TABLE `prompts`;--> statement-breakpoint
ALTER TABLE `__new_prompts` RENAME TO `prompts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `prompt_versions` ADD `is_major_version` integer DEFAULT true NOT NULL;