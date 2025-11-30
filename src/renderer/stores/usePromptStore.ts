import { create } from 'zustand';
import { IpcPromptListItem, IpcPromptDetail, IpcModel, IpcPromptVersion, IpcOutputSample } from 'shared/ipc-types';
import { PromptService } from 'renderer/features/prompts/domain/PromptService';
import { CreatePromptPayload, UpdatePromptPayload, CreateVersionPayload, CreateOutputSamplePayload } from 'renderer/features/prompts/domain/models';

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
  
  createPrompt: (payload: CreatePromptPayload) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  
  // Unified update action
  updatePrompt: (id: string, payload: UpdatePromptPayload) => Promise<void>;

  createPromptVersion: (payload: CreateVersionPayload) => Promise<IpcPromptVersion>;
  deletePromptVersion: (id: string, promptId: string) => Promise<void>;

  createOutputSample: (payload: CreateOutputSamplePayload) => Promise<IpcOutputSample>;

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
      const prompts = await PromptService.getAllPrompts();
      set({ prompts: prompts || [], isLoadingPrompts: false });
    } catch (err) {
      console.error("Failed to fetch prompts:", err);
      set({ error: "Failed to load prompts", isLoadingPrompts: false });
    }
  },

  fetchPromptDetail: async (id: string) => {
    set({ isLoadingDetail: true, error: null, selectedPromptDetail: null });
    try {
      const detail = await PromptService.getPromptDetail(id);
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

  createPrompt: async (payload) => {
    try {
      const newPrompt = await PromptService.createPrompt(payload);
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
      await PromptService.deletePrompt(id);
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

  updatePrompt: async (id, payload) => {
    try {
      await PromptService.updatePrompt(id, payload);
      
      const isMetadataUpdate = payload.name !== undefined || payload.description !== undefined || payload.tags !== undefined;
      const isDraftUpdate = payload.currentContent !== undefined || payload.currentModelId !== undefined 
                            || payload.currentTemperature !== undefined || payload.currentTokenLimit !== undefined 
                            || payload.currentTopK !== undefined || payload.currentTopP !== undefined;

      set((state) => {
        let newPrompts = state.prompts;
        let newDetail = state.selectedPromptDetail;

        // Update list if metadata changed
        if (isMetadataUpdate) {
            newPrompts = state.prompts.map(p => {
                if (p.id !== id) return p;
                return {
                    ...p,
                    ...payload.name && { name: payload.name },
                    ...payload.description && { description: payload.description },
                    ...payload.tags && { tags: payload.tags },
                    lastModified: Date.now()
                };
            });
        }

        // Update detail if it's the current one
        if (newDetail?.id === id) {
            newDetail = {
                ...newDetail,
                ...payload // Spread all updates directly into detail
            };
        }

        return {
            prompts: newPrompts,
            selectedPromptDetail: newDetail
        };
      });

    } catch (err) {
      console.error("Failed to update prompt:", err);
      set({ error: "Failed to update prompt" });
    }
  },

  createPromptVersion: async (payload) => {
    try {
      const newVersion = await PromptService.createVersion(payload);
      
      // Update prompts list lastModified (saving version is a major event)
      set((state) => ({
        prompts: state.prompts.map(p => p.id === payload.promptId ? { ...p, lastModified: Date.now() } : p),
      }));

      // Refetch details to get the new version list
      get().fetchPromptDetail(payload.promptId);

      return newVersion;
    } catch (err) {
      console.error("Failed to create prompt version:", err);
      set({ error: "Failed to create prompt version" });
      throw err;
    }
  },

  deletePromptVersion: async (id, promptId) => {
    try {
      await PromptService.deleteVersion(id);
      
      // Refetch details to update the version list
      get().fetchPromptDetail(promptId);
    } catch (err) {
      console.error("Failed to delete prompt version:", err);
      set({ error: "Failed to delete prompt version" });
    }
  },

  createOutputSample: async (payload) => {
    try {
      const newSample = await PromptService.createOutputSample(payload);
      
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
      const models = await PromptService.getAllModels();
      set({ models });
    } catch (err) {
      console.error("Failed to fetch models:", err);
    }
  }

}));

