import { ipcMain, IpcMainInvokeEvent, app, clipboard } from 'electron';
import { db } from '../db';
import { IpcChannels, IpcPromptListItem, IpcPromptDetail, IpcPromptVersion, IpcOutputSample, IpcModel, IpcTag, PromptApi } from '../../shared/ipc-types';
import * as schema from '../../shared/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq, sql } from 'drizzle-orm';

export function registerPromptIpcHandlers() {

  // --- Prompt Handlers ---

  ipcMain.handle(IpcChannels.COPY_TO_CLIPBOARD, async (_event: IpcMainInvokeEvent, text: string) => {
    clipboard.writeText(text);
  });

  ipcMain.handle(IpcChannels.GET_ALL_PROMPTS, async (): Promise<IpcPromptListItem[]> => {
    const prompts = await db.query.prompts.findMany({
      with: {
        promptsToTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    return prompts.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      tags: p.promptsToTags.map(pt => pt.tag.name),
      lastModified: p.updatedAt.getTime(),
    }));
  });

  ipcMain.handle(IpcChannels.GET_PROMPT_DETAILS, async (_event: IpcMainInvokeEvent, id: string): Promise<IpcPromptDetail | null> => {
    const prompt = await db.query.prompts.findFirst({
      where: eq(schema.prompts.id, id),
      with: {
        promptsToTags: {
          with: {
            tag: true,
          },
        },
        versions: {
          with: {
            outputSamples: true,
          },
          orderBy: (versions, { asc }) => [asc(versions.versionNumber)],
        },
      },
    });

    if (!prompt) return null;

    const tags = prompt.promptsToTags.map(pt => pt.tag.name);
    const versions: IpcPromptVersion[] = prompt.versions.map(v => ({
      id: v.id,
      versionNumber: v.versionNumber,
      label: v.label || `v${v.versionNumber}`,
      content: v.content,
      modelId: v.modelId || undefined,
      temperature: v.temperature || undefined,
      tokenLimit: v.tokenLimit || undefined,
      topK: v.topK || undefined,
      topP: v.topP || undefined,
      isMajorVersion: v.isMajorVersion,
      createdAt: v.createdAt.getTime(),
      note: v.note || undefined,
    }));

    const allOutputSamples: IpcOutputSample[] = prompt.versions.flatMap(v => 
      v.outputSamples.map(os => ({
        id: os.id,
        versionId: os.versionId,
        name: os.name,
        content: os.content,
        createdAt: os.createdAt.getTime(),
      }))
    );

    return {
      id: prompt.id,
      name: prompt.name,
      description: prompt.description || '',
      currentContent: prompt.currentContent || '',
      currentModelId: prompt.currentModelId || undefined,
      currentTemperature: prompt.currentTemperature || 0.7,
      currentTokenLimit: prompt.currentTokenLimit || undefined,
      currentTopK: prompt.currentTopK || undefined,
      currentTopP: prompt.currentTopP || undefined,
      isFavorite: prompt.isFavorite,
      isArchived: prompt.isArchived,
      tags,
      versions,
      outputSamples: allOutputSamples,
    };
  });

  ipcMain.handle(IpcChannels.CREATE_PROMPT, async (_event: IpcMainInvokeEvent, name: string, description: string, tagNames: string[], modelId?: string): Promise<IpcPromptListItem> => {
    const newPromptId = uuidv4();
    const now = new Date();

    await db.insert(schema.prompts).values({
      id: newPromptId,
      name,
      description,
      currentContent: `You are a helpful assistant.`, 
      currentModelId: modelId || 'gpt-4o', 
      currentTemperature: 0.7,
      currentTokenLimit: 2000,
      createdAt: now,
      updatedAt: now,
    });

    // Associate tags
    const tagsToAssociate: { promptId: string; tagId: number }[] = [];
    for (const tagName of tagNames) {
      let tag = await db.query.tags.findFirst({ where: eq(schema.tags.name, tagName) });
      if (!tag) {
        const [newTagId] = await db.insert(schema.tags).values({ name: tagName }).returning({ id: schema.tags.id });
        tag = { id: newTagId.id, name: tagName, color: null };
      }
      if (tag) {
        tagsToAssociate.push({ promptId: newPromptId, tagId: tag.id });
      }
    }
    if (tagsToAssociate.length > 0) {
      await db.insert(schema.promptsToTags).values(tagsToAssociate);
    }

    // Create initial version
    await db.insert(schema.promptVersions).values({
      id: uuidv4(),
      promptId: newPromptId,
      versionNumber: 1,
      label: 'v1',
      content: `You are a helpful assistant.`,
      modelId: modelId || 'gpt-4o',
      temperature: 0.7,
      tokenLimit: 2000,
      isMajorVersion: true,
      createdAt: now,
    });

    const createdPrompt = await db.query.prompts.findFirst({
      where: eq(schema.prompts.id, newPromptId),
      with: {
        promptsToTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    if (!createdPrompt) {
      throw new Error('Failed to retrieve created prompt.');
    }

    return {
      id: createdPrompt.id,
      name: createdPrompt.name,
      description: createdPrompt.description || '',
      tags: createdPrompt.promptsToTags.map(pt => pt.tag.name),
      lastModified: createdPrompt.updatedAt.getTime(),
    };
  });

  ipcMain.handle(IpcChannels.UPDATE_PROMPT, async (_event: IpcMainInvokeEvent, id: string, updates: Parameters<PromptApi['updatePrompt']>[1]): Promise<void> => {
    const metadataKeys = ['name', 'description', 'isFavorite', 'isArchived'];
    const hasMetadataUpdate = Object.keys(updates).some(key => metadataKeys.includes(key));
    
    // Convert undefined to null for Drizzle to set fields to NULL
    const updateData: Record<string, any> = { ...updates };
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        updateData[key] = null;
      }
    });

    if (hasMetadataUpdate) {
        updateData.updatedAt = new Date();
    }

    if (Object.keys(updateData).length === 0) return;

    await db.update(schema.prompts).set(updateData).where(eq(schema.prompts.id, id));
  });

  ipcMain.handle(IpcChannels.UPDATE_PROMPT_TAGS, async (_event: IpcMainInvokeEvent, id: string, newTagNames: string[]): Promise<void> => {
    await db.delete(schema.promptsToTags).where(eq(schema.promptsToTags.promptId, id));

    const tagsToAssociate: { promptId: string; tagId: number }[] = [];
    for (const tagName of newTagNames) {
      let tag = await db.query.tags.findFirst({ where: eq(schema.tags.name, tagName) });
      if (!tag) {
        const [newTagId] = await db.insert(schema.tags).values({ name: tagName }).returning({ id: schema.tags.id });
        tag = { id: newTagId.id, name: tagName, color: null };
      }
      if (tag) {
        tagsToAssociate.push({ promptId: id, tagId: tag.id });
      }
    }
    if (tagsToAssociate.length > 0) {
      await db.insert(schema.promptsToTags).values(tagsToAssociate);
    }
    await db.update(schema.prompts).set({ updatedAt: new Date() }).where(eq(schema.prompts.id, id));
  });

  ipcMain.handle(IpcChannels.DELETE_PROMPT, async (_event: IpcMainInvokeEvent, id: string): Promise<void> => {
    await db.delete(schema.prompts).where(eq(schema.prompts.id, id));
  });

  ipcMain.handle(IpcChannels.CREATE_PROMPT_VERSION, async (
    _event: IpcMainInvokeEvent,
    promptId: string,
    label: string,
    content: string,
    modelId: string,
    temperature: number,
    tokenLimit: number | undefined,
    topK: number | undefined,
    topP: number | undefined,
    note: string | undefined,
    isMajorVersion: boolean,
    copySamplesFromVersionId?: string,
    archivePreviousVersionId?: string,
  ): Promise<IpcPromptVersion> => {
    const existingVersions = await db.query.promptVersions.findMany({
      where: eq(schema.promptVersions.promptId, promptId),
      orderBy: (versions, { desc }) => [desc(versions.versionNumber)],
      limit: 1,
    });
    const newVersionNumber = existingVersions.length > 0 ? existingVersions[0].versionNumber + 1 : 1;
    const newVersionId = uuidv4();
    const now = new Date();

    if (archivePreviousVersionId) {
      await db.update(schema.promptVersions)
        .set({ isMajorVersion: false })
        .where(eq(schema.promptVersions.id, archivePreviousVersionId));
    }

    await db.insert(schema.promptVersions).values({
      id: newVersionId,
      promptId,
      versionNumber: newVersionNumber,
      label: label || `v${newVersionNumber}`,
      content,
      modelId,
      temperature,
      tokenLimit,
      topK,
      topP,
      note,
      isMajorVersion,
      createdAt: now,
    });

    if (copySamplesFromVersionId) {
      const samplesToCopy = await db.query.outputSamples.findMany({
        where: eq(schema.outputSamples.versionId, copySamplesFromVersionId),
      });
      
      if (samplesToCopy.length > 0) {
        await db.insert(schema.outputSamples).values(samplesToCopy.map(s => ({
          id: uuidv4(),
          versionId: newVersionId,
          name: s.name,
          content: s.content,
          createdAt: now,
        })));
      }
    }

    // Update parent prompt's updatedAt, as a new version (save) is a major modification
    await db.update(schema.prompts)
      .set({ updatedAt: now })
      .where(eq(schema.prompts.id, promptId));

    const createdVersion = await db.query.promptVersions.findFirst({ where: eq(schema.promptVersions.id, newVersionId) });
    if (!createdVersion) throw new Error('Failed to create prompt version.');

    return {
      id: createdVersion.id,
      versionNumber: createdVersion.versionNumber,
      label: createdVersion.label || `v${createdVersion.versionNumber}`,
      content: createdVersion.content,
      modelId: createdVersion.modelId || undefined,
      temperature: createdVersion.temperature || undefined,
      tokenLimit: createdVersion.tokenLimit || undefined,
      topK: createdVersion.topK || undefined,
      topP: createdVersion.topP || undefined,
      isMajorVersion: createdVersion.isMajorVersion,
      createdAt: createdVersion.createdAt.getTime(),
      note: createdVersion.note || undefined,
    };
  });

  ipcMain.handle(IpcChannels.CREATE_OUTPUT_SAMPLE, async (_event: IpcMainInvokeEvent, versionId: string, name: string, content: string): Promise<IpcOutputSample> => {
    const newSampleId = uuidv4();
    const now = new Date();

    await db.insert(schema.outputSamples).values({
      id: newSampleId,
      versionId,
      name,
      content,
      createdAt: now,
    });

    const createdSample = await db.query.outputSamples.findFirst({ where: eq(schema.outputSamples.id, newSampleId) });
    if (!createdSample) throw new Error('Failed to create output sample.');

    return {
      id: createdSample.id,
      versionId: createdSample.versionId,
      name: createdSample.name,
      content: createdSample.content,
      createdAt: createdSample.createdAt.getTime(),
    };
  });

  // --- Model Handlers --- 
  ipcMain.handle(IpcChannels.GET_ALL_MODELS, async (): Promise<IpcModel[]> => {
    const models = await db.query.models.findMany();
    return models.map(m => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      contextWindow: m.contextWindow,
      maxOutputTokens: m.maxOutputTokens || undefined,
      isActive: m.isActive,
    }));
  });

  ipcMain.handle(IpcChannels.ADD_MODEL, async (_event: IpcMainInvokeEvent, model: Omit<IpcModel, 'id'>): Promise<IpcModel> => {
    const newModelId = uuidv4();
    await db.insert(schema.models).values({
      id: newModelId,
      name: model.name,
      provider: model.provider,
      contextWindow: model.contextWindow,
      maxOutputTokens: model.maxOutputTokens,
      isActive: model.isActive,
    });

    const createdModel = await db.query.models.findFirst({ where: eq(schema.models.id, newModelId) });
    if (!createdModel) throw new Error('Failed to create model.');

    return createdModel;
  });

  ipcMain.handle(IpcChannels.TOGGLE_MODEL_ACTIVE, async (_event: IpcMainInvokeEvent, id: string, isActive: boolean): Promise<void> => {
    await db.update(schema.models).set({ isActive }).where(eq(schema.models.id, id));
  });

  ipcMain.handle(IpcChannels.DELETE_MODEL, async (_event: IpcMainInvokeEvent, id: string): Promise<{ success: boolean; wasReferenced: boolean }> => {
    try {
      await db.delete(schema.models).where(eq(schema.models.id, id));
      return { success: true, wasReferenced: false };
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        await db.update(schema.models).set({ isActive: false }).where(eq(schema.models.id, id));
        return { success: true, wasReferenced: true };
      }
      throw error;
    }
  });

  ipcMain.handle(IpcChannels.GET_ALL_TAGS, async (): Promise<IpcTag[]> => {
    const tags = await db.query.tags.findMany();
    return tags.map(t => ({ id: t.id, name: t.name }));
  });

  ipcMain.handle(IpcChannels.ADD_TAG, async (_event: IpcMainInvokeEvent, name: string): Promise<IpcTag> => {
    const existingTag = await db.query.tags.findFirst({ where: eq(schema.tags.name, name) });
    if (existingTag) return existingTag;

    const [newTagId] = await db.insert(schema.tags).values({ name }).returning({ id: schema.tags.id });
    const createdTag = await db.query.tags.findFirst({ where: eq(schema.tags.id, newTagId.id) });
    if (!createdTag) throw new Error('Failed to create tag.');
    return createdTag;
  });

  ipcMain.handle(IpcChannels.APP_GET_PATH, async (_event: IpcMainInvokeEvent, name: Parameters<PromptApi['getAppPath']>[0]): Promise<string> => {
    return app.getPath(name);
  });

  ipcMain.handle(IpcChannels.GET_APP_VERSION, async (): Promise<string> => {
    return app.getVersion();
  });
}
