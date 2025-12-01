import fs from 'fs';
import { app } from 'electron';
import { join, dirname } from 'path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

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

// --- Migration Logic ---
function runMigrations() {
  let migrationsFolder = join(process.cwd(), 'drizzle');
  
  if (app.isPackaged) {
    migrationsFolder = join(process.resourcesPath, 'drizzle');
  }

  console.log('Running migrations from:', migrationsFolder);

  try {
    migrate(db, { migrationsFolder });
    console.log('Database migration completed successfully.');
  } catch (error) {
    console.error('Database migration failed:', error);
  }
}

// --- Seeding Logic ---
async function seedDatabase() {
  runMigrations(); // Ensure tables exist via migration
  const existingModels = await db.query.models.findMany();
  if (existingModels.length === 0) {
    console.log('Seeding initial models...');
    await db.insert(schema.models).values([
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', contextWindow: 128000, maxOutputTokens: 4096 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', contextWindow: 128000, maxOutputTokens: 4096 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', contextWindow: 16385, maxOutputTokens: 4096 },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', contextWindow: 200000, maxOutputTokens: 8192 },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', contextWindow: 200000, maxOutputTokens: 4096 },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', contextWindow: 200000, maxOutputTokens: 4096 },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', contextWindow: 2000000, maxOutputTokens: 8192 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', contextWindow: 1000000, maxOutputTokens: 8192 },
      { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'Meta', contextWindow: 128000, maxOutputTokens: 4096 },
      { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Meta', contextWindow: 128000, maxOutputTokens: 4096 },
      { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Meta', contextWindow: 128000, maxOutputTokens: 4096 },
      // Chinese Models
      { id: 'deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek', contextWindow: 128000, maxOutputTokens: 4096 },
      { id: 'deepseek-coder', name: 'DeepSeek Coder V2', provider: 'DeepSeek', contextWindow: 128000, maxOutputTokens: 4096 },
      { id: 'qwen-2.5-72b', name: 'Qwen 2.5 72B', provider: 'Alibaba Cloud', contextWindow: 128000, maxOutputTokens: 8192 },
      { id: 'qwen-2.5-7b', name: 'Qwen 2.5 7B', provider: 'Alibaba Cloud', contextWindow: 128000, maxOutputTokens: 8192 },
      { id: 'yi-1.5-34b', name: 'Yi 1.5 34B', provider: '01.AI', contextWindow: 32000, maxOutputTokens: 4096 },
      { id: 'glm-4', name: 'GLM-4', provider: 'Zhipu AI', contextWindow: 128000, maxOutputTokens: 4096 },
      { id: 'glm-4-flash', name: 'GLM-4 Flash', provider: 'Zhipu AI', contextWindow: 128000, maxOutputTokens: 4096 },
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
        currentContent: `You are an expert Article Summarizer specialized in distilling complex information into clear, concise, and actionable insights.

Your Task:
1. Analyze the provided news article to identify its core message, key arguments, and supporting evidence.
2. Produce a summary that adheres to the following structure:
   - **Headline**: A powerful one-sentence overview of the article's main point.
   - **Key Takeaways**: A bulleted list (3-5 points) highlighting the most critical facts or arguments.
   - **Context/Implications**: A brief explanation of why this news matters or its potential future impact.

Constraints:
- Maintain a neutral and objective tone.
- Avoid jargon unless necessary (and explain if used).
- Ensure the total length is suitable for a quick briefing (approx. 200 words).`,
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
        currentContent: `You are a Senior Software Engineer and Code Refactoring Specialist. Your goal is to transform legacy or messy code into clean, maintainable, and high-performance solutions.

Your Task:
1. Analyze the provided code snippet for code smells, performance bottlenecks, and security vulnerabilities.
2. Refactor the code adhering to **SOLID principles** and industry standard design patterns.
3. Improve naming conventions for variables and functions to enhance readability.
4. Add concise comments where logic is complex, but prefer self-documenting code.

Output Format:
- **Refactored Code**: The complete, runnable improved code block.
- **Change Log**: A brief list explaining *why* specific changes were made (e.g., "Extracted logic to utility function to reduce cognitive load").`,
        currentModelId: 'claude-3-5-sonnet',
        currentTemperature: 0.5,
        currentTokenLimit: 4000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: emailPolisherId,
        name: 'Email Polisher',
        description: 'Make emails sound more professional.',
        currentContent: `You are an Executive Communications Assistant engaged to refine email drafts for professional correspondence.

Your Task:
1. Rewrite the provided email draft to ensure it is **professional, polite, and concise**.
2. Fix any grammatical errors or awkward phrasing.
3. Adjust the tone to be "Professional yet Approachable" (unless a specific tone is requested).
4. Ensure the Call to Action (CTA) or main request is clear and hard to miss.

Input:
[Draft Email Content]

Output:
[Polished Email Version]`,
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
        currentContent: `You are a Creative Culinary Architect. Your mission is to design unique and delicious recipes based on a limited set of ingredients.

Your Task:
1. Create a recipe that utilizes the provided list of ingredients. You may assume basic pantry staples (oil, salt, pepper, water) are available.
2. Structure the recipe clearly with:
   - **Recipe Name**: A catchy and descriptive title.
   - **Prep Time & Cook Time**: Realistic estimates.
   - **Ingredients List**: Quantities and specific items.
   - **Step-by-Step Instructions**: Numbered, clear, and easy to follow actions.
   - **Chef's Tip**: A suggestion for plating, substitution, or enhancing flavor.

Constraints:
- Highlight if the recipe fits any specific dietary style (e.g., Vegetarian, Low-Carb) if applicable based on ingredients.`,
        currentModelId: 'gpt-4o',
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
