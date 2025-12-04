ALTER TABLE `prompts` ADD `current_mode` text DEFAULT 'api' NOT NULL;--> statement-breakpoint
ALTER TABLE `prompt_versions` ADD `mode` text DEFAULT 'api' NOT NULL;