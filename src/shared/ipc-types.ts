
// Define IPC channel names
export const IpcChannels = {
  // Prompts
  GET_ALL_PROMPTS: 'prompt:get-all',
  GET_PROMPT_DETAILS: 'prompt:get-details',
  CREATE_PROMPT: 'prompt:create',
  UPDATE_PROMPT: 'prompt:update',
  DELETE_PROMPT: 'prompt:delete',
  UPDATE_PROMPT_TAGS: 'prompt:update-tags',
  CREATE_PROMPT_VERSION: 'prompt:create-version',
  DELETE_PROMPT_VERSION: 'prompt:delete-version',
  UPDATE_PROMPT_VERSION: 'prompt:update-version',
  // Models
  GET_ALL_MODELS: 'model:get-all',
  ADD_MODEL: 'model:add',
  TOGGLE_MODEL_ACTIVE: 'model:toggle-active',
  DELETE_MODEL: 'model:delete',
  // Tags
  GET_ALL_TAGS: 'tag:get-all',
  ADD_TAG: 'tag:add',
  // Other
  APP_GET_PATH: 'app:get-path',
  COPY_TO_CLIPBOARD: 'app:copy-to-clipboard',
  GET_APP_VERSION: 'app:get-version',
  // Output Samples
  CREATE_OUTPUT_SAMPLE: 'output-sample:create',
  UPDATE_OUTPUT_SAMPLE: 'output-sample:update',
  DELETE_OUTPUT_SAMPLE: 'output-sample:delete',
} as const; // `as const` ensures string literal types

export type IpcChannel = typeof IpcChannels[keyof typeof IpcChannels];

// --- Data types for IPC communication ---
// These should ideally mirror your DB schema types or simplified versions for the UI

// Simplified Prompt for display in lists
export interface IpcPromptListItem {
  id: string;
  name: string;
  description: string;
  tags: string[]; // Aggregated tag names
  lastModified: number; // Unix timestamp
}

// Full Prompt details for the detail pane
export interface IpcPromptDetail {
  id: string;
  name: string;
  description: string;
  currentContent: string;
  currentModelId?: string;
  currentTemperature: number;
  currentTokenLimit?: number;
  currentTopK?: number;
  currentTopP: number;
  currentMode: 'api' | 'chat';
  isFavorite: boolean;
  isArchived: boolean;
  tags: string[]; // Aggregated tag names
  versions: IpcPromptVersion[];
  outputSamples: IpcOutputSample[]; // Note: these are version-specific, but might be aggregated for current
}

export interface IpcPromptVersion {
  id: string;
  versionNumber: number;
  label: string;
  content: string; // The prompt text
  modelId?: string;
  temperature?: number;
  tokenLimit?: number;
  topK: number;
  topP: number;
  mode: 'api' | 'chat';
  note: string | null;
  isMajorVersion: boolean;
}

export interface IpcOutputSample {
  id: string;
  versionId: string; // Must be linked to a specific version
  name: string;
  content: string;
  createdAt: number;
}

export interface IpcModel {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxOutputTokens?: number | null;
  isActive?: boolean | null;
}

export interface IpcTag {
  id: number;
  name: string;
}

// --- API exposed to renderer via contextBridge ---
// This is what the renderer will call directly
export interface PromptApi {
  getAllPrompts(): Promise<IpcPromptListItem[]>;
  getPromptDetails(id: string): Promise<IpcPromptDetail | null>;
  createPrompt(name: string, description: string, tags: string[], modelId?: string): Promise<IpcPromptListItem>;
  updatePrompt(
    id: string,
    updates: {
      name?: string;
      description?: string;
      currentContent?: string;
      currentModelId?: string;
      currentTemperature?: number;
      currentTokenLimit?: number;
      currentTopK?: number;
      currentTopP?: number;
  currentMode?: 'api' | 'chat';
      isFavorite?: boolean;
      isArchived?: boolean;
    }
  ): Promise<void>;
  updatePromptTags(id: string, newTags: string[]): Promise<void>;
  deletePrompt(id: string): Promise<void>;

  getAllModels(): Promise<IpcModel[]>;
  addModel(model: Omit<IpcModel, 'id'>): Promise<IpcModel>;
  toggleModelActive(id: string, isActive: boolean): Promise<void>;
  deleteModel(id: string): Promise<{ success: boolean; wasReferenced: boolean }>;

  getAllTags(): Promise<IpcTag[]>;
  addTag(name: string): Promise<IpcTag>;

  createPromptVersion(
    promptId: string,
    label: string,
    content: string,
    modelId: string,
    temperature: number,
    tokenLimit: number | undefined,
    topK: number | undefined,
    topP: number | undefined,
    mode: 'api' | 'chat',
    note: string | undefined,
    isMajorVersion: boolean,
    copySamplesFromVersionId?: string,
    archivePreviousVersionId?: string,
  ): Promise<IpcPromptVersion>;

  deletePromptVersion(id: string): Promise<void>;

  updatePromptVersion(
    id: string,
    updates: {
      label?: string;
      note?: string;
    }
  ): Promise<void>;

  createOutputSample(
    versionId: string,
    name: string,
    content: string,
  ): Promise<IpcOutputSample>;

  updateOutputSample(
    id: string,
    updates: {
      name?: string;
      content?: string;
    }
  ): Promise<void>;

  deleteOutputSample(id: string): Promise<void>;

  copyToClipboard(text: string): Promise<void>;

  // For renderer to use main process utilities
  getAppPath(name: 'home' | 'appData' | 'userData' | 'temp' | 'exe' | 'module' | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | 'recent' | 'logs' | 'crashDumps'): Promise<string>;
  getAppVersion(): Promise<string>;
}
declare global {
  interface Window {
    promptApi: PromptApi;
  }
}
