import { useState } from "react";
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
import { Settings, Monitor, Cpu, Info, Plus, Trash2 } from "lucide-react";
import { cn } from "renderer/lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsTab = "general" | "models" | "about";

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [customModels, setCustomModels] = useState<string[]>(["gpt-4o", "claude-3.5-sonnet"]);
  const [newModelName, setNewModelName] = useState("");

  const handleAddModel = () => {
    if (newModelName.trim() && !customModels.includes(newModelName.trim())) {
      setCustomModels([...customModels, newModelName.trim()]);
      setNewModelName("");
    }
  };

  const handleDeleteModel = (model: string) => {
    setCustomModels(customModels.filter((m) => m !== model));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] h-[500px] p-0 gap-0 overflow-hidden flex">
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
                      <Label className="text-base">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle application dark mode.
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Auto-Save</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save prompts while editing.
                      </p>
                    </div>
                    <Switch defaultChecked />
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
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add new model ID..." 
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddModel()}
                    />
                    <Button onClick={handleAddModel}>
                      <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </div>

                  <ScrollArea className="h-[250px] pr-2">
                    <div className="space-y-2">
                      {customModels.map((model) => (
                        <div key={model} className="flex items-center justify-between p-2 rounded-md border bg-card">
                          <span className="text-sm font-medium">{model}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteModel(model)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {customModels.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No custom models added.
                        </div>
                      )}
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
