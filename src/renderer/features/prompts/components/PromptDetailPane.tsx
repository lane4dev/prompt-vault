import { useState } from "react";
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
import { Save, Copy, Clock, Pencil, Check, X, Plus, Trash2, Eye, Edit3, MoreHorizontal } from "lucide-react";
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
  AlertDialogTrigger,
} from "renderer/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle as DialogTitleShadcn,
} from "renderer/components/ui/dialog";

import { PromptHistorySidebar } from "./PromptHistorySidebar";

interface OutputSample {
  id: string;
  name: string;
  content: string;
}

interface PromptVersion {
  id: string;
  name: string;
  promptContent: string;
  // Other version-specific fields like model, temperature, etc., would go here.
  // For now, we'll keep the main prompt detail form separate from version content
  // but in a real app, these would be versioned too.
}

export function PromptDetailPane() {
  const [isEditingName, setIsEditingName] = useState(false);
  const [promptName, setPromptName] = useState("Article Summarizer");
  const [tempPromptName, setTempPromptName] = useState(promptName);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Prompt Version Management
  const [versions, setVersions] = useState<PromptVersion[]>([
    { id: "v1", name: "v1", promptContent: "You are a helpful assistant that summarizes text..." },
  ]);

  const [activeVersionId, setActiveVersionId] = useState<string>("v1");
  const [isRenamingVersion, setIsRenamingVersion] = useState(false);
  const [tempVersionName, setTempVersionName] = useState("");
  const [isDeletingVersion, setIsDeletingVersion] = useState(false);

  // Sample Management State
  const [samples, setSamples] = useState<OutputSample[]>([
    { id: "1", name: "Sample 1", content: "This is the first example output." }
  ]);

  const [activeSampleId, setActiveSampleId] = useState<string>("1");
  const [outputMode, setOutputMode] = useState<'preview' | 'edit'>('preview');

  const handleSaveName = () => {
    setPromptName(tempPromptName);
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setTempPromptName(promptName);
    setIsEditingName(false);
  };

  const activeVersion = versions.find(v => v.id === activeVersionId);
  const activeSample = samples.find(s => s.id === activeSampleId);

  const handleAddVersion = () => {
    const newId = `v${versions.length + 1}`;

    const newVersion: PromptVersion = {
      id: newId,
      name: newId,
      promptContent: activeVersion?.promptContent || "", // Copy content from active version
    };

    setVersions([...versions, newVersion]);
    setActiveVersionId(newId);
  };

  const handleRenameVersion = () => {
    if (activeVersion && tempVersionName.trim()) {
      setVersions(versions.map(v =>
        v.id === activeVersionId ? { ...v, name: tempVersionName.trim() } : v
      ));

      setIsRenamingVersion(false);
      setTempVersionName("");
    }
  };

  const handleDeleteVersion = () => {
    const newVersions = versions.filter(v => v.id !== activeVersionId);

    setVersions(newVersions);

    if (newVersions.length > 0) {
      setActiveVersionId(newVersions[newVersions.length - 1].id); // Select the last one
    } else {
      // No versions left, create a new default one
      const newId = "v1";

      setVersions([{ id: newId, name: newId, promptContent: "" }]);
      setActiveVersionId(newId);
    }
    setIsDeletingVersion(false);
  };

  const handlePromptContentChange = (newContent: string) => {
    setVersions(versions.map(v =>
      v.id === activeVersionId ? { ...v, promptContent: newContent } : v
    ));
  };

  const handleAddSample = () => {
    const newId = String(Date.now());
    const newSample = { id: newId, name: `Sample ${samples.length + 1}`, content: "" };

    setSamples([...samples, newSample]);
    setActiveSampleId(newId);
  };

  const handleDeleteSample = (idToDelete: string) => {
    const newSamples = samples.filter(s => s.id !== idToDelete);

    setSamples(newSamples);

    if (activeSampleId === idToDelete && newSamples.length > 0) {
      setActiveSampleId(newSamples[newSamples.length - 1].id);
    }
  };

  const handleSampleChange = (key: keyof OutputSample, value: string) => {
    setSamples(samples.map(s =>
      s.id === activeSampleId ? { ...s, [key]: value } : s
    ));
  };

  const [model, setModel] = useState("gpt-4o");

  const handleModelChange = (value: string) => {
    setModel(value);
  };

  const [promptMode, setPromptMode] = useState<'api' | 'chat'>('api');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Header */}
      <div className="flex items-center px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                className="text-lg font-bold w-[300px] px-2"
                value={tempPromptName}
                onChange={(e) => setTempPromptName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={handleSaveName}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">{promptName}</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Select value={promptMode} onValueChange={(v: 'api' | 'chat') => setPromptMode(v)}>
            <SelectTrigger className="w-[110px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="api">API Call</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Centered Version Management Group */}
        <div className="flex flex-1 justify-center items-center gap-1">
          <div className="flex items-center gap-1 rounded-md bg-muted/50 p-1">
            <Tabs value={activeVersionId} onValueChange={setActiveVersionId} className="h-8">
              <TabsList className="h-7">
                {versions.map((version) => (
                  <TabsTrigger key={version.id} value={version.id}>
                    {version.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddVersion} title="Add new version">
              <Plus className="h-4 w-4" />
            </Button>
            {/* Dropdown for Version Actions */}
            {activeVersion && (versions.length > 0) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setTempVersionName(activeVersion.name); setIsRenamingVersion(true); }}>
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
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)}>
            <Clock className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Metadata Form */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Goal</Label>
            <Input placeholder="One sentence goal..." defaultValue="Summarize news articles" />
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {promptMode === 'api' && (
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Temperature</Label>
              <Input type="number" step="0.1" defaultValue="0.7" />
            </div>
            <div className="space-y-2">
              <Label>Token Limit</Label>
              <Input type="number" defaultValue="2000" />
            </div>
            <div className="space-y-2">
              <Label>Top-K</Label>
              <Input type="number" />
            </div>
            <div className="space-y-2">
              <Label>Top-P</Label>
              <Input type="number" />
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
              defaultValue={activeVersion?.promptContent}
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
      <PromptHistorySidebar open={isHistoryOpen} onOpenChange={setIsHistoryOpen} />

      {/* Rename Version Dialog */}
      <Dialog open={isRenamingVersion} onOpenChange={setIsRenamingVersion}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitleShadcn>Rename Version</DialogTitleShadcn>
            <DialogDescription>
              Enter a new name for version "{activeVersion?.name}".
            </DialogDescription>
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
              This action cannot be undone. This will permanently delete the "{activeVersion?.name}" version.
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
    </div>
  );
}
