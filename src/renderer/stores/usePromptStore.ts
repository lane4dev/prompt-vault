import { create } from 'zustand';
import { IpcPromptListItem, IpcPromptDetail, IpcModel, IpcPromptVersion, IpcOutputSample } from 'shared/ipc-types';

interface PromptState {
  // State
  prompts: IpcPromptListItem[];
  selectedPromptId: string | null;
  selectedPromptDetail: IpcPromptDetail | null;
  isLoadingPrompts: boolean;
  isLoadingDetail: boolean;
  error: string | null;
  models: IpcModel[];

  // Actions
  fetchPrompts: () => Promise<void>;
  fetchPromptDetail: (id: string) => Promise<void>;
  setSelectedPromptId: (id: string | null) => void;

  createPrompt: (name: string, description: string, tags: string[], modelId?: string) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;

  updatePromptName: (id: string, newName: string) => Promise<void>;
  updatePromptDescription: (id: string, newDescription: string) => Promise<void>;
  updatePromptTags: (id: string, newTags: string[]) => Promise<void>;

  // Detail-specific updates (operate on selectedPromptDetail)
  updatePromptCurrentContent: (id: string, content: string) => Promise<void>;
  updatePromptCurrentModelId: (id: string, modelId: string) => Promise<void>;
  updatePromptCurrentTemperature: (id: string, temperature: number) => Promise<void>;
  updatePromptCurrentTokenLimit: (id: string, tokenLimit: number) => Promise<void>;
  updatePromptCurrentTopK: (id: string, topK: number) => Promise<void>;
  updatePromptCurrentTopP: (id: string, topP: number) => Promise<void>;

  createPromptVersion: (
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
    archivePreviousVersionId?: string
  ) => Promise<IpcPromptVersion>;

  createOutputSample: (versionId: string, name: string, content: string) => Promise<IpcOutputSample>;

  fetchModels: () => Promise<void>;
}

export const usePromptStore = create<PromptState>((set, get) => ({
  // Initial State
  prompts: [],
  selectedPromptId: null,
  selectedPromptDetail: null,
  isLoadingPrompts: false,
  isLoadingDetail: false,
  error: null,
  models: [],

  // Actions
  fetchPrompts: async () => {
    set({ isLoadingPrompts: true, error: null });
    try {
      const prompts = await window.promptApi.getAllPrompts();
      set({ prompts: prompts || [], isLoadingPrompts: false });
    } catch (err) {
      console.error("Failed to fetch prompts:", err);
      set({ error: "Failed to load prompts", isLoadingPrompts: false });
    }
  },

  fetchPromptDetail: async (id: string) => {
    set({ isLoadingDetail: true, error: null, selectedPromptDetail: null });
    try {
      const detail = await window.promptApi.getPromptDetails(id);
      set({ selectedPromptDetail: detail, isLoadingDetail: false });
    } catch (err) {
      console.error(`Failed to fetch prompt detail for ${id}:`, err);
      set({ error: "Failed to load prompt details", isLoadingDetail: false });
    }
  },

  setSelectedPromptId: (id: string | null) => {
    set({ selectedPromptId: id });
    if (id) {
      get().fetchPromptDetail(id);
    } else {
      set({ selectedPromptDetail: null });
    }
  },

  createPrompt: async (name, description, tags, modelId) => {
    try {
      const newPrompt = await window.promptApi.createPrompt(name, description, tags, modelId);
      set((state) => ({
        prompts: [...state.prompts, newPrompt],
        selectedPromptId: newPrompt.id
      }));
      // Immediately fetch detail for the new prompt
      get().fetchPromptDetail(newPrompt.id);
    } catch (err) {
      console.error("Failed to create prompt:", err);
      set({ error: "Failed to create prompt" });
      throw err;
    }
  },

  deletePrompt: async (id) => {
    try {
      await window.promptApi.deletePrompt(id);
      set((state) => {
        const newPrompts = state.prompts.filter(p => p.id !== id);
        let newSelectedId = state.selectedPromptId;
        if (state.selectedPromptId === id) {
          newSelectedId = newPrompts.length > 0 ? newPrompts[0].id : null;
        }
        return { prompts: newPrompts, selectedPromptId: newSelectedId };
      });

      // If we switched prompts, fetch the new one
      const newId = get().selectedPromptId;
      if (newId) {
        get().fetchPromptDetail(newId);
      } else {
        set({ selectedPromptDetail: null });
      }
    } catch (err) {
      console.error("Failed to delete prompt:", err);
      set({ error: "Failed to delete prompt" });
    }
  },

  updatePromptName: async (id, newName) => {
    try {
      await window.promptApi.updatePrompt(id, { name: newName });
      set((state) => ({
        prompts: state.prompts.map(p => p.id === id ? { ...p, name: newName, lastModified: Date.now() } : p),
        selectedPromptDetail: state.selectedPromptDetail?.id === id
          ? { ...state.selectedPromptDetail, name: newName }
          : state.selectedPromptDetail
      }));
    } catch (err) {
      console.error("Failed to update prompt name:", err);
      set({ error: "Failed to update prompt name" });
    }
  },

  updatePromptDescription: async (id, newDescription) => {
    try {
      await window.promptApi.updatePrompt(id, { description: newDescription });
      set((state) => ({
        prompts: state.prompts.map(p => p.id === id ? { ...p, description: newDescription, lastModified: Date.now() } : p),
        selectedPromptDetail: state.selectedPromptDetail?.id === id
          ? { ...state.selectedPromptDetail, description: newDescription }
          : state.selectedPromptDetail
      }));
    } catch (err) {
      console.error("Failed to update prompt description:", err);
      set({ error: "Failed to update prompt description" });
    }
  },

  updatePromptTags: async (id, newTags) => {
    try {
      await window.promptApi.updatePromptTags(id, newTags);
      set((state) => ({
        prompts: state.prompts.map(p => p.id === id ? { ...p, tags: newTags, lastModified: Date.now() } : p),
        selectedPromptDetail: state.selectedPromptDetail?.id === id
          ? { ...state.selectedPromptDetail, tags: newTags }
          : state.selectedPromptDetail
      }));
    } catch (err) {
      console.error("Failed to update prompt tags:", err);
      set({ error: "Failed to update prompt tags" });
    }
  },

  updatePromptCurrentContent: async (id, content) => {
    try {
      await window.promptApi.updatePrompt(id, { currentContent: content });
      // This doesn't update 'prompts' list lastModified, as it's a draft change
      set((state) => ({
        selectedPromptDetail: state.selectedPromptDetail?.id === id
          ? { ...state.selectedPromptDetail, currentContent: content }
          : state.selectedPromptDetail
      }));
    } catch (err) {
      console.error("Failed to update prompt content:", err);
      set({ error: "Failed to update prompt content" });
    }
  },

  updatePromptCurrentModelId: async (id, modelId) => {
    try {
      await window.promptApi.updatePrompt(id, { currentModelId: modelId });
      set((state) => ({
        selectedPromptDetail: state.selectedPromptDetail?.id === id
          ? { ...state.selectedPromptDetail, currentModelId: modelId }
          : state.selectedPromptDetail
      }));
    } catch (err) {
      console.error("Failed to update prompt model:", err);
      set({ error: "Failed to update prompt model" });
    }
  },

  updatePromptCurrentTemperature: async (id, temperature) => {
    try {
      await window.promptApi.updatePrompt(id, { currentTemperature: temperature });
      set((state) => ({
        selectedPromptDetail: state.selectedPromptDetail?.id === id
          ? { ...state.selectedPromptDetail, currentTemperature: temperature }
          : state.selectedPromptDetail
      }));
    } catch (err) {
      console.error("Failed to update prompt temperature:", err);
      set({ error: "Failed to update prompt temperature" });
    }
  },

  updatePromptCurrentTokenLimit: async (id, tokenLimit) => {
    try {
      await window.promptApi.updatePrompt(id, { currentTokenLimit: tokenLimit });
      set((state) => ({
        selectedPromptDetail: state.selectedPromptDetail?.id === id
          ? { ...state.selectedPromptDetail, currentTokenLimit: tokenLimit }
          : state.selectedPromptDetail
      }));
    } catch (err) {
      console.error("Failed to update prompt token limit:", err);
      set({ error: "Failed to update prompt token limit" });
    }
  },

  updatePromptCurrentTopK: async (id, topK) => {
    try {
      await window.promptApi.updatePrompt(id, { currentTopK: topK });
      set((state) => ({
        selectedPromptDetail: state.selectedPromptDetail?.id === id
          ? { ...state.selectedPromptDetail, currentTopK: topK }
          : state.selectedPromptDetail
      }));
    } catch (err) {
      console.error("Failed to update prompt top K:", err);
      set({ error: "Failed to update prompt top K" });
    }
  },

  updatePromptCurrentTopP: async (id, topP) => {
    try {
      await window.promptApi.updatePrompt(id, { currentTopP: topP });
      set((state) => ({
        selectedPromptDetail: state.selectedPromptDetail?.id === id
          ? { ...state.selectedPromptDetail, currentTopP: topP }
          : state.selectedPromptDetail
      }));
    } catch (err) {
      console.error("Failed to update prompt top P:", err);
      set({ error: "Failed to update prompt top P" });
    }
  },

  createPromptVersion: async (
    promptId,
    label,
    content,
    modelId,
    temperature,
    tokenLimit,
    topK,
    topP,
    note,
    isMajorVersion,
    copySamplesFromVersionId,
    archivePreviousVersionId
  ) => {
    try {
      const newVersion = await window.promptApi.createPromptVersion(
        promptId, label, content, modelId, temperature, tokenLimit, topK, topP, note, isMajorVersion, copySamplesFromVersionId, archivePreviousVersionId
      );

      // Update prompts list lastModified
      set((state) => ({
        prompts: state.prompts.map(p => p.id === promptId ? { ...p, lastModified: Date.now() } : p),
      }));

      // Refetch details to get the new version list
      get().fetchPromptDetail(promptId);

      return newVersion;
    } catch (err) {
      console.error("Failed to create prompt version:", err);
      set({ error: "Failed to create prompt version" });
      throw err;
    }
  },

  createOutputSample: async (versionId, name, content) => {
    try {
      const newSample = await window.promptApi.createOutputSample(versionId, name, content);

      // We might need to update the selectedPromptDetail if the sample belongs to one of its versions.
      // However, outputSamples are usually nested inside versions or fetched separately.
      // Based on IpcPromptDetail, 'outputSamples' is a top-level array in the detail response?
      // Let's check IpcPromptDetail definition. It says: "outputSamples: IpcOutputSample[]".
      // Assuming this list contains ALL samples for the prompt or relevant ones.
      // For now, easiest is to refetch detail or manually append if we know where.
      // Since `createOutputSample` is often called from the UI, refetching is safer to ensure consistency.
      const currentId = get().selectedPromptId;
      if (currentId) {
        get().fetchPromptDetail(currentId);
      }

      return newSample;
    } catch (err) {
      console.error("Failed to create output sample:", err);
      set({ error: "Failed to create output sample" });
      throw err;
    }
  },

  fetchModels: async () => {
    try {
      const models = await window.promptApi.getAllModels();
      set({ models });
    } catch (err) {
      console.error("Failed to fetch models:", err);
    }
  }

}));
