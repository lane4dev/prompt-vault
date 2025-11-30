import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannels, PromptApi } from '../shared/ipc-types'

declare global {
  interface Window {
    promptApi: PromptApi
  }
}

const promptApi: PromptApi = {
  getAllPrompts: () => ipcRenderer.invoke(IpcChannels.GET_ALL_PROMPTS),
  getPromptDetails: (id) => ipcRenderer.invoke(IpcChannels.GET_PROMPT_DETAILS, id),
  createPrompt: (name, description, tags, modelId) => ipcRenderer.invoke(IpcChannels.CREATE_PROMPT, name, description, tags, modelId),
  updatePrompt: (id, updates) => ipcRenderer.invoke(IpcChannels.UPDATE_PROMPT, id, updates),
  updatePromptTags: (id, newTags) => ipcRenderer.invoke(IpcChannels.UPDATE_PROMPT_TAGS, id, newTags),
  deletePrompt: (id) => ipcRenderer.invoke(IpcChannels.DELETE_PROMPT, id),

  getAllModels: () => ipcRenderer.invoke(IpcChannels.GET_ALL_MODELS),
  addModel: (model) => ipcRenderer.invoke(IpcChannels.ADD_MODEL, model),
  toggleModelActive: (id, isActive) => ipcRenderer.invoke(IpcChannels.TOGGLE_MODEL_ACTIVE, id, isActive),
  deleteModel: (id) => ipcRenderer.invoke(IpcChannels.DELETE_MODEL, id),

  getAllTags: () => ipcRenderer.invoke(IpcChannels.GET_ALL_TAGS),
  addTag: (name) => ipcRenderer.invoke(IpcChannels.ADD_TAG, name),

  createPromptVersion: (promptId, label, content, modelId, temperature, tokenLimit, topK, topP, note, isMajorVersion, copySamplesFromVersionId, archivePreviousVersionId) => 
    ipcRenderer.invoke(IpcChannels.CREATE_PROMPT_VERSION, promptId, label, content, modelId, temperature, tokenLimit, topK, topP, note, isMajorVersion, copySamplesFromVersionId, archivePreviousVersionId),

  createOutputSample: (versionId, name, content) => 
    ipcRenderer.invoke(IpcChannels.CREATE_OUTPUT_SAMPLE, versionId, name, content),

  copyToClipboard: (text) => ipcRenderer.invoke(IpcChannels.COPY_TO_CLIPBOARD, text),

  getAppPath: (name) => ipcRenderer.invoke(IpcChannels.APP_GET_PATH, name),
  getAppVersion: () => ipcRenderer.invoke(IpcChannels.GET_APP_VERSION),
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('promptApi', promptApi)

