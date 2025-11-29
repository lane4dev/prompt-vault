import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// --- Models Table ---
export const models = sqliteTable('models', {
  id: text('id').primaryKey(), // e.g., "gpt-4o"
  name: text('name').notNull().unique(),
  provider: text('provider').notNull(), // "OpenAI", "Anthropic", "Ollama"
  contextWindow: integer('context_window').notNull(),
  maxOutputTokens: integer('max_output_tokens'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

// --- Prompts Table (Drafts / Workspace) ---
export const prompts = sqliteTable('prompts', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull(),
  description: text('description'), // Goal
  
  // Draft State (Current Workspace)
  currentContent: text('current_content').default(''),
  currentModelId: text('current_model_id').references(() => models.id),
  currentTemperature: real('current_temperature').default(0.7),
  currentTokenLimit: integer('current_token_limit').default(2000),
  currentTopK: integer('current_top_k'),
  currentTopP: real('current_top_p'),

  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// --- Prompt Versions Table (History Snapshots) ---
export const promptVersions = sqliteTable('prompt_versions', {
  id: text('id').primaryKey(), // UUID
  promptId: text('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  label: text('label'), // e.g., "v1", "Release 1.0"
  
  // Snapshot Data
  content: text('content').notNull(),
  modelId: text('model_id').references(() => models.id),
  temperature: real('temperature'),
  tokenLimit: integer('token_limit'),
  topK: integer('top_k'),
  topP: real('top_p'),
  
  isMajorVersion: integer('is_major_version', { mode: 'boolean' }).default(true).notNull(),
  note: text('note'), // Optional commit message
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// --- Tags Table ---
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  color: text('color'),
});

// --- Prompts <-> Tags Join Table ---
export const promptsToTags = sqliteTable('prompts_to_tags', {
  promptId: text('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.promptId, t.tagId] }),
}));

// --- Output Samples Table ---
export const outputSamples = sqliteTable('output_samples', {
  id: text('id').primaryKey(), // UUID
  versionId: text('version_id').notNull().references(() => promptVersions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // "Sample 1"
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// --- RELATIONS ---

export const promptsRelations = relations(prompts, ({ many, one }) => ({
  versions: many(promptVersions),
  promptsToTags: many(promptsToTags),
  currentModel: one(models, {
    fields: [prompts.currentModelId],
    references: [models.id],
  }),
}));

export const promptVersionsRelations = relations(promptVersions, ({ one, many }) => ({
  prompt: one(prompts, {
    fields: [promptVersions.promptId],
    references: [prompts.id],
  }),
  model: one(models, {
    fields: [promptVersions.modelId],
    references: [models.id],
  }),
  outputSamples: many(outputSamples),
}));

export const outputSamplesRelations = relations(outputSamples, ({ one }) => ({
  version: one(promptVersions, {
    fields: [outputSamples.versionId],
    references: [promptVersions.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  promptsToTags: many(promptsToTags),
}));

export const promptsToTagsRelations = relations(promptsToTags, ({ one }) => ({
  prompt: one(prompts, {
    fields: [promptsToTags.promptId],
    references: [prompts.id],
  }),
  tag: one(tags, {
    fields: [promptsToTags.tagId],
    references: [tags.id],
  }),
}));

export const modelsRelations = relations(models, ({ many }) => ({
  prompts: many(prompts),
  promptVersions: many(promptVersions),
}));