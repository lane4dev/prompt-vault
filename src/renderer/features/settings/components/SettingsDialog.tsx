import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "renderer/components/ui/dialog";
import { Button } from "renderer/components/ui/button";
import { Input } from "renderer/components/ui/input";
import { Label } from "renderer/components/ui/label";
import { Switch } from "renderer/components/ui/switch";
import { Separator } from "renderer/components/ui/separator";
import { ScrollArea } from "renderer/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "renderer/components/ui/select";
import { Settings, Monitor, Cpu, Info, Plus, Trash2 } from "lucide-react";
import { cn } from "renderer/lib/utils";
import { IpcModel } from "shared/ipc-types";
import { useTheme } from "renderer/components/theme-provider";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsTab = "general" | "models" | "about";

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [models, setModels] = useState<IpcModel[]>([]);
  const [newModelName, setNewModelName] = useState("");
  const [newModelContextWindow, setNewModelContextWindow] = useState<number>(4096);
  const { theme, setTheme } = useTheme();

  const formatTokens = (num: number): string => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(0) + "M";
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(0) + "K";
    }
    return num.toString();
  };

  useEffect(() => {
    if (open && activeTab === 'models') {
      fetchModels();
    }
  }, [open, activeTab]);

  const fetchModels = async () => {
    try {
      const fetchedModels = await window.promptApi.getAllModels();
      setModels(fetchedModels);
    } catch (err) {
      console.error("Failed to fetch models:", err);
    }
  };

  const handleAddModel = async () => {
    try {
      const newModel = await window.promptApi.addModel({
        name: newModelName.trim(),
        provider: 'Custom',
        contextWindow: newModelContextWindow,
        maxOutputTokens: 4096,
        isActive: true
      });
      setModels([...models, newModel]);
      setNewModelName("");
      setNewModelContextWindow(4096);
    } catch (err) {
      console.error("Failed to add model:", err);
      // A simple alert for unexpected API errors, as name collision is handled by UI disablement.
      alert("Failed to add model. Please try again.");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await window.promptApi.toggleModelActive(id, !currentStatus);
      setModels(models.map(m => m.id === id ? { ...m, isActive: !currentStatus } : m));
    } catch (err) {
      console.error("Failed to toggle model status:", err);
    }
  };

  const handleDeleteModel = async (id: string) => {
    try {
      const result = await window.promptApi.deleteModel(id);
      if (result.success) {
        if (result.wasReferenced) {
          // Soft deleted
          setModels(models.map(m => m.id === id ? { ...m, isActive: false } : m));
          alert("This model is currently used by one or more prompts. It has been deactivated instead of deleted to preserve data integrity.");
        } else {
          // Hard deleted
          setModels(models.filter(m => m.id !== id));
        }
      }
    } catch (err) {
      console.error("Failed to delete model:", err);
      alert("Failed to delete model.");
    }
  };

  const isNameEmpty = newModelName.trim() === '';
  const isNameDuplicate = models.some(
    (m) => m.name.toLowerCase() === newModelName.trim().toLowerCase(),
  );

  const derivedNameError = isNameEmpty
    ? "Model name cannot be empty."
    : isNameDuplicate
      ? "Model with this name already exists."
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[650px] p-0 gap-0 overflow-hidden flex">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        {/* Left Sidebar: Navigation */}
        <div className="w-[200px] bg-muted/30 border-r flex flex-col p-2 space-y-1">
          <div className="px-3 py-2 text-sm font-semibold text-muted-foreground mb-2">
            Settings
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn("justify-start", activeTab === "general" && "bg-accent")}
            onClick={() => setActiveTab("general")}
          >
            <Monitor className="mr-2 h-4 w-4" />
            General
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("justify-start", activeTab === "models" && "bg-accent")}
            onClick={() => setActiveTab("models")}
          >
            <Cpu className="mr-2 h-4 w-4" />
            Models
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("justify-start", activeTab === "about" && "bg-accent")}
            onClick={() => setActiveTab("about")}
          >
            <Info className="mr-2 h-4 w-4" />
            About
          </Button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col h-full bg-background">
          <ScrollArea className="flex-1 p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">General</h3>
                  <p className="text-sm text-muted-foreground">
                    Customize your app experience.
                  </p>
                </div>
                <Separator />
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Theme</Label>
                      <p className="text-sm text-muted-foreground">
                        Select the application theme.
                      </p>
                    </div>
                    <Select value={theme} onValueChange={(val: any) => setTheme(val)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "models" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Models</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage the list of available LLM models.
                  </p>
                </div>
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex gap-2 items-end">
                    <div className="grid gap-1.5 flex-1">
                      <Label htmlFor="modelName">Name</Label>
                      <Input 
                        id="modelName"
                        placeholder="Model name (e.g. GPT-4o)" 
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddModel()}
                      />
                    </div>
                    <div className="grid gap-1.5 w-[140px]">
                      <Label htmlFor="contextWindow">Context Window</Label>
                      <Input 
                        id="contextWindow"
                        type="number"
                        placeholder="Context" 
                        value={newModelContextWindow}
                        onChange={(e) => setNewModelContextWindow(Number(e.target.value))}
                        onKeyDown={(e) => e.key === "Enter" && handleAddModel()}
                      />
                    </div>
                    <Button onClick={handleAddModel} disabled={isNameEmpty || isNameDuplicate}>
                      <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </div>
                  {derivedNameError && !isNameEmpty && (
                    <p className="text-sm text-red-500 -mt-2">{derivedNameError}</p>
                  )}

                  <ScrollArea className="h-[250px] pr-2 border rounded-md">
                    <div className="p-1">
                      {models.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No models found.
                        </div>
                      )}
                      {models.map((model) => (
                        <div key={model.id} className={cn("flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors", !model.isActive && "text-muted-foreground italic")}>
                          <div className="flex flex-col">
                              <span className="text-sm font-medium">{model.name} {model.isActive === false && "(Inactive)"}</span>
                              <span className="text-xs text-muted-foreground">{model.provider} • {formatTokens(model.contextWindow)} tokens</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                                checked={model.isActive || false}
                                onCheckedChange={() => handleToggleActive(model.id, model.isActive || false)}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteModel(model.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}

            {activeTab === "about" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">About</h3>
                  <p className="text-sm text-muted-foreground">
                    Version and information.
                  </p>
                </div>
                <Separator />
                <div className="text-sm space-y-2">
                  <p><strong>Prompt Vault</strong> v0.1.0</p>
                  <p className="text-muted-foreground">
                    A local-first prompt engineering tool designed for efficiency and privacy.
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
