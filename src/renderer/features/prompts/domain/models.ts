export interface UpdatePromptPayload {
  name?: string;
  description?: string;
  currentContent?: string;
  currentModelId?: string;
  currentTemperature?: number;
  currentTokenLimit?: number;
  currentTopK?: number;
  currentTopP?: number;
  currentMode?: 'api' | 'chat';
  tags?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
}

export interface CreateVersionPayload {
  promptId: string;
  label: string;
  content: string;
  modelId: string;
  temperature: number;
  tokenLimit?: number;
  topK?: number;
  topP?: number;
  mode?: 'api' | 'chat';
  note?: string;
  isMajorVersion: boolean;
  copySamplesFromVersionId?: string;
  archivePreviousVersionId?: string;
}

export interface CreatePromptPayload {
  name: string;
  description: string;
  tags: string[];
  modelId?: string;
}

export interface CreateOutputSamplePayload {
  versionId: string;
  name: string;
  content: string;
}
