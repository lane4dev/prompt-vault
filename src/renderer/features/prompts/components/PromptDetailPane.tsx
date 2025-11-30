import { useState, useEffect, useMemo } from "react";
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
import { Save, Copy, Clock, Pencil, Check, X, Plus, Trash2, Eye, Edit3, MoreHorizontal, ChevronDown } from "lucide-react";
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
  DialogDescription,
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
import { v4 as uuidv4 } from "uuid";

import { PromptHistorySidebar } from "./PromptHistorySidebar";
import { IpcPromptVersion, IpcOutputSample, IpcModel } from "shared/ipc-types";
import { usePromptStore } from "renderer/stores/usePromptStore";

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
    createOutputSample,
    fetchModels,
  } = usePromptStore();

  // Local states for editable fields, synchronized with promptDetail
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempPromptName, setTempPromptName] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");
  const [currentContent, setCurrentContent] = useState("");
  const [currentModelId, setCurrentModelId] = useState("");
  const [currentTemperature, setCurrentTemperature] = useState(0.7);
  const [currentTokenLimit, setCurrentTokenLimit] = useState<number | undefined>(2000);
  const [currentTopK, setCurrentTopK] = useState<number | undefined>(undefined);
  const [currentTopP, setCurrentTopP] = useState<number | undefined>(undefined);

  // Tags Popover State
  const [isTagsPopoverOpen, setIsTagsPopoverOpen] = useState(false);
  const [currentPromptTags, setCurrentPromptTags] = useState<string[]>([]);

  // Prompt Version Management State
  const [versions, setVersions] = useState<IpcPromptVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [isRenamingVersion, setIsRenamingVersion] = useState(false);
  const [tempVersionName, setTempVersionName] = useState("");
  const [isDeletingVersion, setIsDeletingVersion] = useState(false);

  // Output Samples Management State
  const [samples, setSamples] = useState<IpcOutputSample[]>([]);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [outputMode, setOutputMode] = useState<'preview' | 'edit'>('preview');

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [promptMode, setPromptMode] = useState<'api' | 'chat'>('api');

  // Revert Version State
  const [isRevertingVersion, setIsRevertingVersion] = useState(false);
  const [versionToRevert, setVersionToRevert] = useState<IpcPromptVersion | null>(null);

  // --- Data Fetching & Synchronization --- //
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    if (promptDetail) {
      setTempPromptName(promptDetail.name);
      setCurrentDescription(promptDetail.description);
      setCurrentContent(promptDetail.currentContent);
      setCurrentModelId(promptDetail.currentModelId || "");
      setCurrentTemperature(promptDetail.currentTemperature);
      setCurrentTokenLimit(promptDetail.currentTokenLimit);
      setCurrentTopK(promptDetail.currentTopK);
      setCurrentTopP(promptDetail.currentTopP);
      setCurrentPromptTags(promptDetail.tags);
      setVersions(promptDetail.versions);

      // Initialize active version if not already set or if switching prompts
      const versionExists = activeVersionId && promptDetail.versions.some(v => v.id === activeVersionId);
      
      if (!versionExists) {
          const majorVersions = promptDetail.versions.filter(v => v.isMajorVersion);
          const latestMajor = majorVersions.length > 0 ? majorVersions[majorVersions.length - 1] : null;
          const fallback = promptDetail.versions.length > 0 ? promptDetail.versions[promptDetail.versions.length - 1] : null;
          const targetId = latestMajor ? latestMajor.id : (fallback ? fallback.id : null);
          setActiveVersionId(targetId);

           if (targetId) {
            const versionSamples = promptDetail.outputSamples.filter(s => s.versionId === targetId);
            setSamples(versionSamples);
            setActiveSampleId(versionSamples.length > 0 ? versionSamples[0].id : null);
          } else {
            setSamples([]);
            setActiveSampleId(null);
          }
      } else {
        // Just update samples for the current active version if data refreshed
        const versionSamples = promptDetail.outputSamples.filter(s => s.versionId === activeVersionId);
        setSamples(versionSamples);
        // Ensure active sample is still valid
        if (activeSampleId && !versionSamples.some(s => s.id === activeSampleId)) {
             setActiveSampleId(versionSamples.length > 0 ? versionSamples[0].id : null);
        }
      }
    } else {
      // Reset if prompt deleted or none selected
      setTempPromptName("");
      setCurrentDescription("");
      setCurrentContent("");
      setCurrentModelId("");
      setCurrentTemperature(0.7);
      setCurrentTokenLimit(2000);
      setCurrentTopK(undefined);
      setCurrentTopP(undefined);
      setCurrentPromptTags([]);
      setVersions([]);
      setActiveVersionId(null);
      setSamples([]);
      setActiveSampleId(null);
    }
  }, [promptDetail]);

  // Update samples when activeVersionId changes (handled by the effect above partially, but needed for manual switching)
  useEffect(() => {
    if (!promptDetail) return; // Ensure promptDetail is loaded
    
    // If activeVersionId changed, we need to load its content into the "Draft" area
    const selectedVersion = versions.find(v => v.id === activeVersionId);

    if (selectedVersion) {
      // 1. Update local states from selected version
      setCurrentContent(selectedVersion.content);
      setCurrentModelId(selectedVersion.modelId || "");
      setCurrentTemperature(selectedVersion.temperature || 0.7);
      setCurrentTokenLimit(selectedVersion.tokenLimit);
      setCurrentTopK(selectedVersion.topK);
      setCurrentTopP(selectedVersion.topP);

      // 2. Update database 'current' fields via IPC to reflect the switch
      updatePrompt(promptDetail.id, {
        currentContent: selectedVersion.content,
        currentModelId: selectedVersion.modelId || "",
        currentTemperature: selectedVersion.temperature || 0.7,
        currentTokenLimit: selectedVersion.tokenLimit || undefined,
        currentTopK: selectedVersion.topK || undefined,
        currentTopP: selectedVersion.topP || undefined
      });

      // 3. Update samples for the selected version
      const versionSamples = promptDetail.outputSamples.filter(s => s.versionId === selectedVersion.id);
      setSamples(versionSamples);
      setActiveSampleId(versionSamples.length > 0 ? versionSamples[0].id : null);
    }
  }, [activeVersionId]); 

  const isModified = useMemo(() => {
    if (!promptDetail) return false;

    // Find the latest major version (the "baseline" for saving a new version)
    const majorVersions = versions.filter(v => v.isMajorVersion);
    const latestMajor = majorVersions.length > 0 ? majorVersions[majorVersions.length - 1] : null;

    if (!latestMajor) {
      // If no major version exists, allow save if there's content
      return !!currentContent.trim();
    }

    // Comparison Logic
    const contentChanged = currentContent !== latestMajor.content;
    const modelChanged = currentModelId !== (latestMajor.modelId || "");
    const tempChanged = currentTemperature !== (latestMajor.temperature || 0.7);
    const tokenLimitChanged = currentTokenLimit !== latestMajor.tokenLimit;
    const topKChanged = currentTopK !== latestMajor.topK;
    const topPChanged = currentTopP !== latestMajor.topP;

    return contentChanged || modelChanged || tempChanged || tokenLimitChanged || topKChanged || topPChanged;
  }, [
    promptDetail,
    versions,
    currentContent,
    currentModelId,
    currentTemperature,
    currentTokenLimit,
    currentTopK,
    currentTopP
  ]);

  // --- Handlers --- //
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

  const activeVersion = versions.find(v => v.id === activeVersionId);
  const activeSample = samples.find(s => s.id === activeSampleId);

  const handleAddVersion = async () => {
    if (!promptDetail) return;
    try {
      const newVersion = await createPromptVersion({
        promptId: promptDetail.id,
        label: `v${versions.filter(v => v.isMajorVersion).length + 1}`,
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
    // TODO: Implement IPC
    if (activeVersion && tempVersionName.trim()) {
      setVersions(versions.map(v =>
        v.id === activeVersionId ? { ...v, label: tempVersionName.trim() } : v
      ));
      setIsRenamingVersion(false);
      setTempVersionName("");
    }
  };

  const handleDeleteVersion = () => {
    // TODO: Implement IPC
    const newVersions = versions.filter(v => v.id !== activeVersionId);
    setVersions(newVersions);

    const nextMajor = newVersions.filter(v => v.isMajorVersion);
    if (nextMajor.length > 0) {
      setActiveVersionId(nextMajor[nextMajor.length - 1].id);
    } else if (newVersions.length > 0) {
      setActiveVersionId(newVersions[newVersions.length - 1].id);
    } else {
      if (promptDetail) {
        // const newVersionId = uuidv4();
      }
    }
    setIsDeletingVersion(false);
  };

  const handlePromptContentChange = async (newContent: string) => {
    if (!promptDetail) return;
    setCurrentContent(newContent);
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

  const handleDeleteSample = (idToDelete: string) => {
    // TODO: Implement IPC
    const newSamples = samples.filter(s => s.id !== idToDelete);
    setSamples(newSamples);
    if (activeSampleId === idToDelete && newSamples.length > 0) {
      setActiveSampleId(newSamples[newSamples.length - 1].id);
    }
  };

  const handleSampleChange = (key: keyof IpcOutputSample, value: string) => {
    // TODO: Implement IPC
    setSamples(samples.map(s =>
      s.id === activeSampleId ? { ...s, [key]: value } : s
    ));
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
    setIsHistoryOpen(false); // Close history sidebar after revert
  };

  const handleRevertCancel = () => {
    setIsRevertingVersion(false);
    setVersionToRevert(null);
  };

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
              <Tabs value={activeVersionId || ""} onValueChange={setActiveVersionId} className="h-10">
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
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Metadata Form */}
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
            <Select value={currentModelId || allModels[0]?.id || ""} onValueChange={handleModelChange}>
              <SelectTrigger>
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
              <Label>Token Limit</Label>
              <Input
                type="number"
                value={currentTokenLimit}
                onChange={handleTokenLimitChange}
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
        {/* Editor Area */}
        <div className="grid grid-cols-2 gap-6 h-[500px]">
          {/* Prompt Editor */}
          <div className="flex flex-col gap-2 h-full border rounded-md p-2 bg-muted/10">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Prompt</Label>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <Textarea
              className="flex-1 font-mono text-sm resize-none"
              placeholder="Enter your system prompt here..."
              value={currentContent}
              onChange={(e) => handlePromptContentChange(e.target.value)}
            />
          </div>
          {/* Output Samples Area */}
          <div className="flex flex-col gap-2 h-full border rounded-md p-2 bg-muted/10">
            <div className="flex items-center justify-between mb-2">
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
            <div className="flex flex-col gap-2 flex-1">
              {/* Sample List / Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 items-center">
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
                <div className="flex flex-col gap-2 flex-1">
                  {outputMode === 'edit' && (
                    <div className="flex items-center gap-2">
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
                      "flex-1 font-mono text-sm resize-none",
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
            <AlertDialogAction onClick={handleDeleteVersion} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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