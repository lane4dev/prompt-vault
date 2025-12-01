import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "renderer/components/ui/button";
import { Input } from "renderer/components/ui/input";
import { Label } from "renderer/components/ui/label";
import { Textarea } from "renderer/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "renderer/components/ui/tabs";
import { Separator } from "renderer/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "renderer/components/ui/select";
import { Save, Copy, Clock, Pencil, Check, X, Plus, Trash2, Eye, Edit3, MoreHorizontal, AlertTriangle } from "lucide-react";
import { cn } from "renderer/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "renderer/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "renderer/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle as DialogTitleShadcn,
} from "renderer/components/ui/dialog";
import { ScrollArea, ScrollBar } from "renderer/components/ui/scroll-area";
import { Badge } from "renderer/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "renderer/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "renderer/components/ui/command";
import { Checkbox } from "renderer/components/ui/checkbox";

import { PromptHistorySidebar } from "./PromptHistorySidebar";
import { IpcPromptVersion, IpcOutputSample } from "shared/ipc-types";
import { usePromptStore } from "renderer/stores/usePromptStore";

const formatTokens = (num: number): string => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(0) + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(0) + "K";
  }
  return num.toString();
};

const estimateTokenCount = (text: string): number => {
  return text.length;
};

const AVAILABLE_TAGS = [
  "Writing", "Productivity", "Coding", "Development", "Business", "Marketing",
  "Data Analysis", "Design", "Research", "Education", "Personal",
];

export function PromptDetailPane() {
  const {
    selectedPromptDetail: promptDetail,
    isLoadingDetail,
    error: errorDetail,
    models: allModels,
    updatePrompt,
    createPromptVersion,
    deletePromptVersion,
    createOutputSample,
    fetchModels,
  } = usePromptStore();

  // --- Derived State (Single Source of Truth) ---
  const versions = useMemo(() => promptDetail?.versions || [], [promptDetail]);
  const activePromptId = promptDetail?.id;

  // Local state for UI controls only
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  
  // Ref to track if we've initialized the active version for the *current* prompt
  const initializedPromptIdRef = useRef<string | null>(null);

  // Editable Fields State (Sync with Active Version / Draft)
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempPromptName, setTempPromptName] = useState("");
  
  // These fields mirror the "Draft" state (prompts table)
  const [currentDescription, setCurrentDescription] = useState("");
  const [currentContent, setCurrentContent] = useState("");
  const [currentModelId, setCurrentModelId] = useState("");
  const [currentTemperature, setCurrentTemperature] = useState(0.7);
  const [currentTokenLimit, setCurrentTokenLimit] = useState<number | undefined>(2000);
  const [currentTopK, setCurrentTopK] = useState<number | undefined>(undefined);
  const [currentTopP, setCurrentTopP] = useState<number | undefined>(undefined);
  const [currentPromptTags, setCurrentPromptTags] = useState<string[]>([]);

  // UI Toggles
  const [isTagsPopoverOpen, setIsTagsPopoverOpen] = useState(false);
  const [isRenamingVersion, setIsRenamingVersion] = useState(false);
  const [tempVersionName, setTempVersionName] = useState("");
  const [isDeletingVersion, setIsDeletingVersion] = useState(false);
  const [outputMode, setOutputMode] = useState<'preview' | 'edit'>('preview');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [promptMode, setPromptMode] = useState<'api' | 'chat'>('api');
  const [isRevertingVersion, setIsRevertingVersion] = useState(false);
  const [versionToRevert, setVersionToRevert] = useState<IpcPromptVersion | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // --- Initialization & Sync Logic ---

  // 1. Fetch Models on mount
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // 2. Initialize or Update State when Prompt Changes
  useEffect(() => {
    if (!promptDetail) {
      // Reset everything if no prompt selected
      initializedPromptIdRef.current = null;
      setActiveVersionId(null);
      return;
    }

    // Is this a newly selected prompt?
    if (initializedPromptIdRef.current !== promptDetail.id) {
      // Initialize Draft State from Prompt (DB "Current" fields)
      setTempPromptName(promptDetail.name);
      setCurrentDescription(promptDetail.description);
      setCurrentContent(promptDetail.currentContent);
      setCurrentModelId(promptDetail.currentModelId || "");
      setCurrentTemperature(promptDetail.currentTemperature);
      setCurrentTokenLimit(promptDetail.currentTokenLimit);
      setCurrentTopK(promptDetail.currentTopK);
      setCurrentTopP(promptDetail.currentTopP);
      setCurrentPromptTags(promptDetail.tags);

      // Initialize Active Version
      // Strategy: Find the latest Major version. If none, fallback to latest.
      const majorVersions = promptDetail.versions.filter(v => v.isMajorVersion);
      const latestMajor = majorVersions.length > 0 ? majorVersions[majorVersions.length - 1] : null;
      const fallback = promptDetail.versions.length > 0 ? promptDetail.versions[promptDetail.versions.length - 1] : null;
      const targetVersionId = latestMajor ? latestMajor.id : (fallback ? fallback.id : null);
      
      setActiveVersionId(targetVersionId);
      
      // Mark as initialized
      initializedPromptIdRef.current = promptDetail.id;
    } else {
      // Prompt ID hasn't changed, but data might have (e.g., after save/update)
      // Only update local state if it differs to avoid overwriting user typing
      // Note: We deliberately DO NOT sync content/params here to avoid cursor jumps or losing unsaved edits
      // The only exception is when we explicitly switch versions (handled in another effect)
      
      // Update Tags (usually safe to sync)
      setCurrentPromptTags(promptDetail.tags);
      setTempPromptName(promptDetail.name); // Sync name in case it changed externally
    }
  }, [promptDetail]);

  // 3. Handle Active Version Switching
  // When user clicks a tab, we load that version's data into the draft
  const handleVersionTabChange = async (versionId: string) => {
    if (!promptDetail) return;
    
    const targetVersion = versions.find(v => v.id === versionId);
    if (!targetVersion) return;

    setActiveVersionId(versionId);
    
    // Load version data into local state
    setCurrentContent(targetVersion.content);
    setCurrentModelId(targetVersion.modelId || "");
    setCurrentTemperature(targetVersion.temperature || 0.7);
    setCurrentTokenLimit(targetVersion.tokenLimit);
    setCurrentTopK(targetVersion.topK);
    setCurrentTopP(targetVersion.topP);

    // Sync with DB "Draft" state
    await updatePrompt(promptDetail.id, {
      currentContent: targetVersion.content,
      currentModelId: targetVersion.modelId || "",
      currentTemperature: targetVersion.temperature || 0.7,
      currentTokenLimit: targetVersion.tokenLimit || undefined,
      currentTopK: targetVersion.topK || undefined,
      currentTopP: targetVersion.topP || undefined
    });
  };

  // --- Derived Calculations ---

  const activeVersion = useMemo(() => 
    versions.find(v => v.id === activeVersionId), 
    [versions, activeVersionId]
  );

  const samples = useMemo(() => {
    if (!promptDetail || !activeVersionId) return [];
    return promptDetail.outputSamples.filter(s => s.versionId === activeVersionId);
  }, [promptDetail, activeVersionId]);

  // Ensure activeSampleId is valid for current list
  useEffect(() => {
    if (samples.length > 0) {
      if (!activeSampleId || !samples.find(s => s.id === activeSampleId)) {
        setActiveSampleId(samples[0].id);
      }
    } else {
      setActiveSampleId(null);
    }
  }, [samples, activeSampleId]);

  const activeSample = useMemo(() => 
    samples.find(s => s.id === activeSampleId),
    [samples, activeSampleId]
  );

  const selectedModel = useMemo(() => {
    return allModels.find(m => m.id === currentModelId);
  }, [currentModelId, allModels]);

  const currentPromptTokens = useMemo(() => estimateTokenCount(currentContent), [currentContent]);
  const modelContextWindow = selectedModel?.contextWindow || 0;

  const { isTokenLimitExceedingContext, isPromptExceedingTokenLimit, isPromptExceedingContext } = useMemo(() => {
    let isTokenLimitExceedingContext = false;
    let isPromptExceedingTokenLimit = false;
    let isPromptExceedingContext = false;

    if (promptMode === 'api') {
      if (currentTokenLimit && modelContextWindow > 0 && currentTokenLimit > modelContextWindow) {
        isTokenLimitExceedingContext = true;
      }
      if (currentTokenLimit && currentPromptTokens > currentTokenLimit) {
        isPromptExceedingTokenLimit = true;
      }
    } else {
      // Chat mode
      if (modelContextWindow > 0 && currentPromptTokens > modelContextWindow) {
        isPromptExceedingContext = true;
      }
    }

    return { isTokenLimitExceedingContext, isPromptExceedingTokenLimit, isPromptExceedingContext };
  }, [promptMode, currentTokenLimit, modelContextWindow, currentPromptTokens]);

  const isModified = useMemo(() => {
    if (!promptDetail) return false;

    // Use the currently active version as the baseline for comparison
    // If no active version is selected (rare), fallback to the latest major version
    const baselineVersion = activeVersion || versions.filter(v => v.isMajorVersion).pop();

    if (!baselineVersion) {
      // If no versions exist at all, allow save if there's content
      return !!currentContent.trim();
    }

    // Comparison Logic
    const contentChanged = currentContent !== baselineVersion.content;
    const modelChanged = currentModelId !== (baselineVersion.modelId || "");
    const tempChanged = currentTemperature !== (baselineVersion.temperature || 0.7);
    const tokenLimitChanged = currentTokenLimit !== baselineVersion.tokenLimit;
    const topKChanged = currentTopK !== baselineVersion.topK;
    const topPChanged = currentTopP !== baselineVersion.topP;

    return contentChanged || modelChanged || tempChanged || tokenLimitChanged || topKChanged || topPChanged;
  }, [
    promptDetail,
    versions,
    activeVersion, // use derived activeVersion
    currentContent,
    currentModelId,
    currentTemperature,
    currentTokenLimit,
    currentTopK,
    currentTopP
  ]);


  // --- Action Handlers ---

  const handleCopyToClipboard = async () => {
    if (!currentContent) return;
    await window.promptApi.copyToClipboard(currentContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveName = async () => {
    if (promptDetail && tempPromptName.trim() !== promptDetail.name) {
      await updatePrompt(promptDetail.id, { name: tempPromptName.trim() });
    }
    setIsEditingName(false);
  };

  const handleCancelEditName = () => {
    if (promptDetail) setTempPromptName(promptDetail.name);
    setIsEditingName(false);
  };

  const handleTagToggle = async (tag: string) => {
    if (!promptDetail) return;
    const newTags = currentPromptTags.includes(tag)
      ? currentPromptTags.filter((t) => t !== tag)
      : [...currentPromptTags, tag];
    setCurrentPromptTags(newTags);
    await updatePrompt(promptDetail.id, { tags: newTags });
  };

  const handleAddVersion = async () => {
    if (!promptDetail) return;
    try {
      const newVersion = await createPromptVersion({
        promptId: promptDetail.id,
        label: "", // Let backend generate label
        content: currentContent,
        modelId: currentModelId,
        temperature: currentTemperature,
        tokenLimit: currentTokenLimit,
        topK: currentTopK,
        topP: currentTopP,
        note: "Manual Version",
        isMajorVersion: true,
      });
      setActiveVersionId(newVersion.id);
    } catch (error) {
      console.error("Failed to add version", error);
    }
  };

  const handleSaveVersion = async () => {
    if (!promptDetail || !activeVersion) return;
    try {
      const newMajorVersion = await createPromptVersion({
        promptId: promptDetail.id,
        label: activeVersion.label,
        content: currentContent,
        modelId: currentModelId,
        temperature: currentTemperature,
        tokenLimit: currentTokenLimit,
        topK: currentTopK,
        topP: currentTopP,
        note: `Saved at ${new Date().toLocaleTimeString()}`,
        isMajorVersion: true,
        copySamplesFromVersionId: activeVersionId || undefined,
        archivePreviousVersionId: activeVersionId || undefined,
      });
       setActiveVersionId(newMajorVersion.id);
    } catch (error) {
       console.error("Failed to save version", error);
    }
  };

  const handleRenameVersion = () => {
    // TODO: Implement IPC logic for renaming
    setIsRenamingVersion(false);
    setTempVersionName("");
  };

  const handleDeleteVersion = async () => {
    if (!activeVersionId || !promptDetail) return;

    try {
      // 1. Determine the next version to switch to BEFORE deleting
      const remainingVersions = versions.filter(v => v.id !== activeVersionId);
      const nextMajor = remainingVersions.filter(v => v.isMajorVersion);
      let nextVersion = null;
      
      if (nextMajor.length > 0) {
        nextVersion = nextMajor[nextMajor.length - 1];
      } else if (remainingVersions.length > 0) {
        nextVersion = remainingVersions[remainingVersions.length - 1];
      }

      // 2. Delete the version
      await deletePromptVersion(activeVersionId, promptDetail.id);

      // 3. Sync Logic
      if (nextVersion) {
         // Switch UI to next version immediately
         setActiveVersionId(nextVersion.id);
         
         // Update DB Draft to match next version
         await updatePrompt(promptDetail.id, {
            currentContent: nextVersion.content,
            currentModelId: nextVersion.modelId || "",
            currentTemperature: nextVersion.temperature || 0.7,
            currentTokenLimit: nextVersion.tokenLimit || undefined,
            currentTopK: nextVersion.topK || undefined,
            currentTopP: nextVersion.topP || undefined
         });
         
         // Update Local State
         setCurrentContent(nextVersion.content);
         setCurrentModelId(nextVersion.modelId || "");
         setCurrentTemperature(nextVersion.temperature || 0.7);
         setCurrentTokenLimit(nextVersion.tokenLimit);
         setCurrentTopK(nextVersion.topK);
         setCurrentTopP(nextVersion.topP);

      } else {
         setActiveVersionId(null);
      }

    } catch (error) {
      console.error("Failed to delete version", error);
    }
    
    setIsDeletingVersion(false);
  };

  // Immediate update handler for typing
  const handlePromptContentChange = async (newContent: string) => {
    if (!promptDetail) return;
    setCurrentContent(newContent);
    // Debounce this in a real app, but for now simple update
    await updatePrompt(promptDetail.id, { currentContent: newContent });
  };

  const handleAddSample = async () => {
    if (!promptDetail || !activeVersionId) return;
    try {
      await createOutputSample({
        versionId: activeVersionId,
        name: `Sample ${samples.length + 1}`,
        content: ""
      });
    } catch (error) {
       console.error("Failed to add sample", error);
    }
  };

  const handleDeleteSample = async (idToDelete: string) => {
    // TODO: Implement confirmation?
    await usePromptStore.getState().deleteOutputSample(idToDelete);
    if (activeSampleId === idToDelete) {
        // If we deleted the active sample, switch to the last one or null
        const newSamples = samples.filter(s => s.id !== idToDelete);
        setActiveSampleId(newSamples.length > 0 ? newSamples[newSamples.length - 1].id : null);
    }
  };

  const handleSampleChange = async (key: keyof IpcOutputSample, value: string) => {
    if (!activeSampleId) return;
    
    // Optimistic local update (though store handles it too, this might feel snappier for typing)
    // Actually, let's rely on the store's optimistic update to avoid conflicting states
    
    await usePromptStore.getState().updateOutputSample(activeSampleId, { [key]: value });
  };

  const handleModelChange = async (value: string) => {
    if (!promptDetail) return;
    setCurrentModelId(value);
    await updatePrompt(promptDetail.id, { currentModelId: value });
  };

  const handleTemperatureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!promptDetail) return;
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setCurrentTemperature(value);
      await updatePrompt(promptDetail.id, { currentTemperature: value });
    }
  };

  const handleTokenLimitChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!promptDetail) return;
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setCurrentTokenLimit(value);
      await updatePrompt(promptDetail.id, { currentTokenLimit: value });
    }
  };

  const handleTopKChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!promptDetail) return;
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setCurrentTopK(value);
      await updatePrompt(promptDetail.id, { currentTopK: value });
    } else if (e.target.value === '') {
      setCurrentTopK(undefined);
      await updatePrompt(promptDetail.id, { currentTopK: undefined });
    }
  };

  const handleTopPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!promptDetail) return;
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setCurrentTopP(value);
      await updatePrompt(promptDetail.id, { currentTopP: value });
    } else if (e.target.value === '') {
      setCurrentTopP(undefined);
      await updatePrompt(promptDetail.id, { currentTopP: undefined });
    }
  };

  const handleDescriptionChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!promptDetail) return;
    const newDescription = e.target.value;
    setCurrentDescription(newDescription);
    await updatePrompt(promptDetail.id, { description: newDescription });
  };

  const handleRevertVersion = (version: IpcPromptVersion) => {
    setVersionToRevert(version);
    setIsRevertingVersion(true);
  };

  const handleRevertConfirm = async () => {
    if (!promptDetail || !versionToRevert) return;

    // Update local states
    setCurrentContent(versionToRevert.content);
    setCurrentModelId(versionToRevert.modelId || "");
    setCurrentTemperature(versionToRevert.temperature || 0.7);
    setCurrentTokenLimit(versionToRevert.tokenLimit);
    setCurrentTopK(versionToRevert.topK);
    setCurrentTopP(versionToRevert.topP);

    // Update DB Draft via IPC
    await updatePrompt(promptDetail.id, {
        currentContent: versionToRevert.content,
        currentModelId: versionToRevert.modelId || "",
        currentTemperature: versionToRevert.temperature || 0.7,
        currentTokenLimit: versionToRevert.tokenLimit || undefined,
        currentTopK: versionToRevert.topK || undefined,
        currentTopP: versionToRevert.topP || undefined
    });

    setIsRevertingVersion(false);
    setVersionToRevert(null);
    setIsHistoryOpen(false);
  };

  const handleRevertCancel = () => {
    setIsRevertingVersion(false);
    setVersionToRevert(null);
  };

  // --- Render ---

  if (isLoadingDetail) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-muted-foreground">
        Loading prompt details...
      </div>
    );
  }

  if (errorDetail) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-destructive">
        Error: {errorDetail}
      </div>
    );
  }

  if (!promptDetail) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-muted-foreground">
        Select a prompt from the sidebar or create a new one.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Header */}
      <div className="flex flex-col px-6 py-4 border-b gap-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  className="text-lg font-bold w-[300px] px-2"
                  value={tempPromptName}
                  onChange={(e) => setTempPromptName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") handleCancelEditName();
                  }}
                  autoFocus
                />
                <Button variant="ghost" size="icon" onClick={handleSaveName}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCancelEditName}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">{promptDetail.name}</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Select
              value={promptMode}
              onValueChange={(v) => setPromptMode(v as 'api' | 'chat')}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">API Call</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Centered Version Management Group */}
          <div className="flex flex-1 justify-center items-center px-4">
            <div className="flex items-center gap-1 rounded-md bg-muted/50 p-1">
              <Tabs value={activeVersionId || ""} onValueChange={handleVersionTabChange} className="h-10">
                <TabsList>
                  {versions.filter(v => v.isMajorVersion).map((version) => (
                    <TabsTrigger key={version.id} value={version.id}>
                      {version.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleAddVersion} title="Create new version">
                <Plus className="h-4 w-4" />
              </Button>
              {/* Dropdown for Version Actions */}
              {activeVersion && (versions.length > 0) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setTempVersionName(activeVersion.label || ""); setIsRenamingVersion(true); }}>
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      disabled={versions.length <= 1}
                      onClick={() => setIsDeletingVersion(true)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsHistoryOpen(true)}>
              <Clock className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button onClick={handleSaveVersion} disabled={!isModified}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Tags Display */}
        <div className="flex items-center gap-2">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2 p-1">
              {promptDetail.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <Popover open={isTagsPopoverOpen} onOpenChange={setIsTagsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-auto shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                Edit Tags
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="end">
              <Command>
                <CommandInput placeholder="Search tags..." />
                <CommandEmpty>No tag found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-48">
                    {AVAILABLE_TAGS.map((tag) => {
                      const isSelected = currentPromptTags.includes(tag);
                      return (
                        <CommandItem
                          key={tag}
                          onSelect={() => handleTagToggle(tag)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleTagToggle(tag)}
                            className="mr-2"
                          />
                          {tag}
                        </CommandItem>
                      );
                    })}
                  </ScrollArea>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 gap-6">
        {/* Metadata Form */}
        <div className="flex-shrink-0 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Goal</Label>
              <Input
                placeholder="One sentence goal..."
                value={currentDescription}
                onChange={handleDescriptionChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <div className="flex items-center gap-2">
                <Select value={currentModelId || allModels[0]?.id || ""} onValueChange={handleModelChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {allModels
                      .filter(m => m.isActive || m.id === currentModelId)
                      .map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} {model.isActive === false ? "(Inactive)" : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedModel && (
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    ({formatTokens(selectedModel.contextWindow)} tokens)
                  </span>
                )}
              </div>
            </div>
          </div>

          {promptMode === 'api' && (
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Temperature</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={currentTemperature}
                  onChange={handleTemperatureChange}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Token Limit
                  {isTokenLimitExceedingContext && (
                     <span className="text-destructive" title="Token limit exceeds model context window">
                       <AlertTriangle className="h-3 w-3" />
                     </span>
                  )}
                </Label>
                <Input
                  type="number"
                  value={currentTokenLimit}
                  onChange={handleTokenLimitChange}
                  className={cn(isTokenLimitExceedingContext && "border-yellow-500 focus-visible:ring-yellow-500")}
                />
              </div>
              <div className="space-y-2">
                <Label>Top-K</Label>
                <Input
                  type="number"
                  value={currentTopK || ""}
                  onChange={handleTopKChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Top-P</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={currentTopP || ""}
                  onChange={handleTopPChange}
                />
              </div>
            </div>
          )}
          <Separator />
        </div>

        {/* Editor Area */}
        <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
          {/* Prompt Editor */}
          <div className={cn("flex flex-col gap-2 h-full min-h-0 border rounded-md p-2 bg-muted/10 transition-colors", (isPromptExceedingTokenLimit || isPromptExceedingContext) && "border-yellow-500 bg-yellow-500/5")}>
            <div className="flex items-center justify-between flex-shrink-0">
              <Label className="text-base font-semibold">Prompt</Label>
              <div className="flex items-center gap-2">
                 <span className={cn("text-xs text-muted-foreground font-mono", (isPromptExceedingTokenLimit || isPromptExceedingContext) && "text-destructive font-bold")}>
                    {formatTokens(currentPromptTokens)} / {formatTokens(promptMode === 'api' ? (currentTokenLimit || 0) : modelContextWindow)} Tokens
                 </span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyToClipboard}>
                  {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <Textarea
              className={cn("flex-1 min-h-0 font-mono text-sm resize-none focus-visible:ring-0 bg-transparent border-none p-0 shadow-none overflow-y-auto")}
              placeholder="Enter your system prompt here..."
              value={currentContent}
              onChange={(e) => handlePromptContentChange(e.target.value)}
            />
          </div>
          {/* Output Samples Area */}
          <div className="flex flex-col gap-2 h-full min-h-0 border rounded-md p-2 bg-muted/10">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">Output Samples</Label>
              </div>
              {/* Mode Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-6 px-2 text-xs", outputMode === 'preview' && "bg-background shadow-sm")}
                  onClick={() => setOutputMode('preview')}
                >
                  <Eye className="h-3 w-3 mr-1" /> Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-6 px-2 text-xs", outputMode === 'edit' && "bg-background shadow-sm")}
                  onClick={() => setOutputMode('edit')}
                >
                  <Edit3 className="h-3 w-3 mr-1" /> Edit
                </Button>
              </div>
            </div>
            {/* Content Logic based on Mode */}
            <div className="flex flex-col gap-2 flex-1 min-h-0">
              {/* Sample List / Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 items-center flex-shrink-0">
                {samples.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => setActiveSampleId(sample.id)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap",
                      activeSampleId === sample.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted"
                    )}
                  >
                    {sample.name}
                  </button>
                ))}
                {outputMode === 'edit' && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={handleAddSample}>
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {/* Active Sample Content */}
              {activeSample ? (
                <div className="flex flex-col gap-2 flex-1 min-h-0">
                  {outputMode === 'edit' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Input
                        value={activeSample.name}
                        onChange={(e) => handleSampleChange('name', e.target.value)}
                        className="h-7 text-xs"
                        placeholder="Sample Name"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteSample(activeSample.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Textarea
                    value={activeSample.content}
                    onChange={(e) => handleSampleChange('content', e.target.value)}
                    readOnly={outputMode === 'preview'}
                    className={cn(
                      "flex-1 min-h-0 font-mono text-sm resize-none overflow-y-auto",
                      outputMode === 'preview' && "bg-muted/30 focus-visible:ring-0"
                    )}
                    placeholder="Paste or write an example output here..."
                  />
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center border border-dashed rounded-md bg-muted/10 text-muted-foreground text-sm">
                  {outputMode === 'edit' ? "No samples. Click + to add one." : "No samples available."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <PromptHistorySidebar
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        versions={activeVersion ? versions.filter(v => v.label === activeVersion.label) : []} // Filter history by current active version label
        onRevertVersion={handleRevertVersion} // Pass the handler
      />

      {/* Rename Version Dialog */}
      <Dialog open={isRenamingVersion} onOpenChange={setIsRenamingVersion}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitleShadcn>Rename Version</DialogTitleShadcn>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={tempVersionName}
                onChange={(e) => setTempVersionName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenamingVersion(false)}>Cancel</Button>
            <Button onClick={handleRenameVersion}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Version Alert Dialog */}
      <AlertDialog open={isDeletingVersion} onOpenChange={setIsDeletingVersion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the "{activeVersion?.label}" version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVersion} variant="destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revert Version Alert Dialog */}
      <AlertDialog open={isRevertingVersion} onOpenChange={setIsRevertingVersion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{`Revert to Version "${versionToRevert?.label}"?`}</AlertDialogTitle>
            <AlertDialogDescription>
              This will load the content and parameters of "{versionToRevert?.label}" into your current draft.
              Any unsaved changes in your draft will be overwritten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRevertCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevertConfirm}>
              Revert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}