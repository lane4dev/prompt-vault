import fs from 'fs';
import { app } from 'electron';
import { join, dirname } from 'path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from '../../shared/db/schema';
import { randomUUID } from 'crypto';


const userDataPath = app.getPath('userData');
const dbPath = join(userDataPath, 'prompt-vault.db');

// Ensure directory exists (though userData always exists)
if (!fs.existsSync(dirname(dbPath))) {
  fs.mkdirSync(dirname(dbPath), { recursive: true });
}

console.log('Loading database from:', dbPath);

const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// --- Schema Initialization ---
function initSchema() {
  const sql = `
    CREATE TABLE IF NOT EXISTS \`models\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`name\` text NOT NULL,
      \`provider\` text NOT NULL,
      \`context_window\` integer NOT NULL,
      \`max_output_tokens\` integer,
      \`is_active\` integer DEFAULT true
    );
    CREATE UNIQUE INDEX IF NOT EXISTS \`models_name_unique\` ON \`models\` (\`name\`);
    
    CREATE TABLE IF NOT EXISTS \`prompts\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`name\` text NOT NULL,
      \`description\` text,
      \`current_content\` text DEFAULT '',
      \`current_model_id\` text,
      \`current_temperature\` real DEFAULT 0.7,
      \`current_token_limit\` integer DEFAULT 2000,
      \`current_top_k\` integer,
      \`current_top_p\` real,
      \`is_favorite\` integer DEFAULT false,
      \`is_archived\` integer DEFAULT false,
      \`created_at\` integer DEFAULT (unixepoch()) NOT NULL,
      \`updated_at\` integer DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (\`current_model_id\`) REFERENCES \`models\`(\`id\`) ON UPDATE no action ON DELETE no action
    );
    
    CREATE TABLE IF NOT EXISTS \`prompt_versions\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`prompt_id\` text NOT NULL,
      \`version_number\` integer NOT NULL,
      \`label\` text,
      \`content\` text NOT NULL,
      \`model_id\` text,
      \`temperature\` real,
      \`token_limit\` integer,
      \`top_k\` integer,
      \`top_p\` real,
      \`is_major_version\` integer DEFAULT true NOT NULL,
      \`note\` text,
      \`created_at\` integer DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (\`prompt_id\`) REFERENCES \`prompts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`model_id\`) REFERENCES \`models\`(\`id\`) ON UPDATE no action ON DELETE no action
    );
    
    CREATE TABLE IF NOT EXISTS \`output_samples\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`version_id\` text NOT NULL,
      \`name\` text NOT NULL,
      \`content\` text NOT NULL,
      \`created_at\` integer DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (\`version_id\`) REFERENCES \`prompt_versions\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );
    
    CREATE TABLE IF NOT EXISTS \`tags\` (
      \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      \`name\` text NOT NULL,
      \`color\` text
    );
    CREATE UNIQUE INDEX IF NOT EXISTS \`tags_name_unique\` ON \`tags\` (\`name\`);
    
    CREATE TABLE IF NOT EXISTS \`prompts_to_tags\` (
      \`prompt_id\` text NOT NULL,
      \`tag_id\` integer NOT NULL,
      PRIMARY KEY(\`prompt_id\`, \`tag_id\`),
      FOREIGN KEY (\`prompt_id\`) REFERENCES \`prompts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );
  `;
  
  sqlite.exec(sql);
}

// --- Seeding Logic ---
async function seedDatabase() {
  initSchema(); // Ensure tables exist
  const existingModels = await db.query.models.findMany();
  if (existingModels.length === 0) {
    console.log('Seeding initial models...');
    await db.insert(schema.models).values([
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', contextWindow: 128000, maxOutputTokens: 4096 },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', contextWindow: 200000, maxOutputTokens: 4096 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', contextWindow: 128000, maxOutputTokens: 4096 },
      { id: 'llama3-8b-8192', name: 'Llama 3 8B', provider: 'Meta', contextWindow: 8192, maxOutputTokens: 4096 },
    ]);
  }

  const existingTags = await db.query.tags.findMany();
  if (existingTags.length === 0) {
    console.log('Seeding initial tags...');
    await db.insert(schema.tags).values([
      { name: 'Writing' }, { name: 'Coding' }, { name: 'Productivity' },
      { name: 'Research' }, { name: 'Education' }, { name: 'Business' },
      { name: 'Marketing' }, { name: 'Data Analysis' }, { name: 'Design' },
      { name: 'Personal' }, { name: 'Cooking' }, { name: 'Creativity' },
    ]);
  }

  const existingPrompts = await db.query.prompts.findMany();
  if (existingPrompts.length === 0) {
    console.log('Seeding initial prompts...');
    const seededTags = await db.query.tags.findMany();

    const writingTag = seededTags.find(t => t.name === 'Writing');
    const codingTag = seededTags.find(t => t.name === 'Coding');
    const productivityTag = seededTags.find(t => t.name === 'Productivity');
    const researchTag = seededTags.find(t => t.name === 'Research');
    const educationTag = seededTags.find(t => t.name === 'Education');
    const businessTag = seededTags.find(t => t.name === 'Business');
    const creativityTag = seededTags.find(t => t.name === 'Creativity');
    const personalTag = seededTags.find(t => t.name === 'Personal');

    const articleSummarizerId = randomUUID();
    const codeRefactorExpertId = randomUUID();
    const emailPolisherId = randomUUID();
    const recipeGeneratorId = randomUUID();

    const now = new Date();

    const promptsData = [
      {
        id: articleSummarizerId,
        name: 'Article Summarizer',
        description: 'Summarize news articles into bullet points.',
        currentContent: 'You are a helpful assistant that summarizes text into concise bullet points.',
        currentModelId: 'gpt-4o',
        currentTemperature: 0.7,
        currentTokenLimit: 2000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: codeRefactorExpertId,
        name: 'Code Refactor Expert',
        description: 'Refactor messy code into clean, solid patterns.',
        currentContent: 'You are an expert in code refactoring. Improve the given code for readability, performance, and maintainability.',
        currentModelId: 'claude-3-sonnet',
        currentTemperature: 0.5,
        currentTokenLimit: 4000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: emailPolisherId,
        name: 'Email Polisher',
        description: 'Make emails sound more professional.',
        currentContent: 'You are a professional email assistant. Rewrite the following email to be more polite and professional.',
        currentModelId: 'gpt-4o',
        currentTemperature: 0.6,
        currentTokenLimit: 1500,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: recipeGeneratorId,
        name: 'Recipe Generator',
        description: 'Generate creative recipes based on available ingredients.',
        currentContent: 'Generate a creative recipe based on the provided ingredients. Include steps, ingredients, and approximate cooking time.',
        currentModelId: 'gpt-4o-mini',
        currentTemperature: 0.9,
        currentTokenLimit: 2500,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await db.insert(schema.prompts).values(promptsData);

    // Seed initial versions for each prompt
    await db.insert(schema.promptVersions).values(promptsData.map(p => ({
      id: randomUUID(),
      promptId: p.id,
      versionNumber: 1,
      label: 'v1',
      content: p.currentContent,
      modelId: p.currentModelId,
      temperature: p.currentTemperature,
      tokenLimit: p.currentTokenLimit,
      isMajorVersion: true,
      createdAt: now,
    })));

    // Associate tags with prompts
    if (writingTag && productivityTag && researchTag && educationTag && personalTag) {
      await db.insert(schema.promptsToTags).values([
        { promptId: articleSummarizerId, tagId: writingTag.id },
        { promptId: articleSummarizerId, tagId: productivityTag.id },
        { promptId: articleSummarizerId, tagId: researchTag.id },
        { promptId: articleSummarizerId, tagId: educationTag.id },
        { promptId: articleSummarizerId, tagId: personalTag.id },
      ]);
    }
    if (codingTag && productivityTag) {
      await db.insert(schema.promptsToTags).values([
        { promptId: codeRefactorExpertId, tagId: codingTag.id },
        { promptId: codeRefactorExpertId, tagId: productivityTag.id },
      ]);
    }
    if (writingTag && businessTag) {
      await db.insert(schema.promptsToTags).values([
        { promptId: emailPolisherId, tagId: writingTag.id },
        { promptId: emailPolisherId, tagId: businessTag.id },
      ]);
    }
    if (creativityTag) {
      await db.insert(schema.promptsToTags).values([
        { promptId: recipeGeneratorId, tagId: creativityTag.id },
      ]);
    }
  }
}

seedDatabase();
