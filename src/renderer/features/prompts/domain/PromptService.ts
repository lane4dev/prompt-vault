import { IpcPromptListItem, IpcPromptDetail, IpcPromptVersion, IpcOutputSample, IpcModel } from 'shared/ipc-types';
import { CreatePromptPayload, UpdatePromptPayload, CreateVersionPayload, CreateOutputSamplePayload } from './models';

export const PromptService = {
  getAllPrompts: async (): Promise<IpcPromptListItem[]> => {
    return await window.promptApi.getAllPrompts();
  },

  getPromptDetail: async (id: string): Promise<IpcPromptDetail | null> => {
    return await window.promptApi.getPromptDetails(id);
  },

  createPrompt: async (payload: CreatePromptPayload): Promise<IpcPromptListItem> => {
    return await window.promptApi.createPrompt(
      payload.name,
      payload.description,
      payload.tags,
      payload.modelId
    );
  },

  updatePrompt: async (id: string, payload: UpdatePromptPayload): Promise<void> => {
    // If tags are present, we need to call updatePromptTags separately or ensure the main process handles it.
    // Based on previous implementation, updatePromptTags was separate.
    // Let's check Ipc-types. updatePrompt takes specific fields. updatePromptTags is separate.
    // We should handle this separation here to keep the caller clean.
    
    const { tags, ...mainUpdates } = payload;

    if (Object.keys(mainUpdates).length > 0) {
      await window.promptApi.updatePrompt(id, mainUpdates);
    }

    if (tags) {
      await window.promptApi.updatePromptTags(id, tags);
    }
  },

  deletePrompt: async (id: string): Promise<void> => {
    await window.promptApi.deletePrompt(id);
  },

  createVersion: async (payload: CreateVersionPayload): Promise<IpcPromptVersion> => {
    return await window.promptApi.createPromptVersion(
      payload.promptId,
      payload.label,
      payload.content,
      payload.modelId,
      payload.temperature,
      payload.tokenLimit,
      payload.topK,
      payload.topP,
      payload.mode || 'api',
      payload.note,
      payload.isMajorVersion,
      payload.copySamplesFromVersionId,
      payload.archivePreviousVersionId
    );
  },

  deleteVersion: async (id: string): Promise<void> => {
    await window.promptApi.deletePromptVersion(id);
  },

  updateVersion: async (id: string, updates: { label?: string; note?: string }): Promise<void> => {
    await window.promptApi.updatePromptVersion(id, updates);
  },

  createOutputSample: async (payload: CreateOutputSamplePayload): Promise<IpcOutputSample> => {
    return await window.promptApi.createOutputSample(
      payload.versionId,
      payload.name,
      payload.content
    );
  },

  updateOutputSample: async (id: string, updates: { name?: string; content?: string }): Promise<void> => {
    await window.promptApi.updateOutputSample(id, updates);
  },

  deleteOutputSample: async (id: string): Promise<void> => {
    await window.promptApi.deleteOutputSample(id);
  },

  getAllModels: async (): Promise<IpcModel[]> => {
    return await window.promptApi.getAllModels();
  }
};
