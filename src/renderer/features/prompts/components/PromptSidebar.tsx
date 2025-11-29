import { useState } from "react";
import { Button } from "renderer/components/ui/button";
import { Input } from "renderer/components/ui/input";
import { ScrollArea } from "renderer/components/ui/scroll-area";
import { Badge } from "renderer/components/ui/badge";
import { Separator } from "renderer/components/ui/separator";
import { Label } from "renderer/components/ui/label";
import { Textarea } from "renderer/components/ui/textarea";
import { Search, Plus, Filter, Folder, Hash, Settings, MoreHorizontal, Trash2, ChevronDown } from "lucide-react";
import { cn } from "renderer/lib/utils";
import { SettingsDialog } from "renderer/features/settings/components/SettingsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  DialogTitle,
} from "renderer/components/ui/dialog";
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

interface Prompt {
  id: string;
  name: string;
  description: string;
  tags: string[];
  model: string;
  lastModified: string;
}

interface PromptSidebarProps {
  className?: string;
  prompts: Prompt[];
  setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>;
  selectedPromptId: string | null;
  setSelectedPromptId: React.Dispatch<React.SetStateAction<string | null>>;
}

const AVAILABLE_TAGS = [
  "Writing", "Productivity", "Coding", "Development", "Business", "Marketing",
  "Data Analysis", "Design", "Research", "Education", "Personal",
];

export function PromptSidebar({ 
  className, 
  prompts,
  setPrompts,
  selectedPromptId,
  setSelectedPromptId,
}: PromptSidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<string | null>(null);

  // Add Prompt State
  const [isAddPromptOpen, setIsAddPromptOpen] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState("");
  const [newPromptGoal, setNewPromptGoal] = useState("");
  const [newPromptTags, setNewPromptTags] = useState<string[]>([]);
  const [isTagsPopoverOpen, setIsTagsPopoverOpen] = useState(false);

  const handleDeletePrompt = () => {
    if (promptToDelete) {
      setPrompts(prompts.filter((p) => p.id !== promptToDelete));
      if (selectedPromptId === promptToDelete) {
        setSelectedPromptId(null);
      }
      setPromptToDelete(null);
    }
  };

  const handleAddPrompt = () => {
    if (!newPromptTitle.trim()) return;

    const newPrompt = {
      id: String(Date.now()),
      name: newPromptTitle,
      description: newPromptGoal,
      tags: newPromptTags,
      model: "gpt-4o", // Default model
      lastModified: "Just now",
    };

    setPrompts([newPrompt, ...prompts]);
    setSelectedPromptId(newPrompt.id);
    setIsAddPromptOpen(false);
    
    // Reset form
    setNewPromptTitle("");
    setNewPromptGoal("");
    setNewPromptTags([]);
  };

  return (
    <div className={cn("flex flex-col h-full border-r bg-muted/10", className)}>
      {/* Header: Search & Add */}
      <div className="p-4 space-y-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Prompts</h2>
          <Button size="icon" variant="ghost" onClick={() => setIsAddPromptOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search prompts..." className="pl-8" />
        </div>
      </div>

      {/* Prompt List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-4 pt-2">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className={cn(
                "group flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent relative cursor-pointer",
                selectedPromptId === prompt.id ? "bg-accent" : "bg-transparent"
              )}
              onClick={() => setSelectedPromptId(prompt.id)}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{prompt.name}</div>
                  <div className="text-xs text-muted-foreground">{prompt.lastModified}</div>
                </div>
                <div className="text-xs text-muted-foreground">Model: {prompt.model}</div>
                <div className="line-clamp-2 text-xs text-muted-foreground mt-1">
                  {prompt.description}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                {prompt.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-1 py-0 text-[10px]">
                    {tag}
                  </Badge>
                ))}
                {prompt.tags.length > 3 && (
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    +{prompt.tags.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Dropdown Menu - Visible on Hover */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={(e) => e.stopPropagation()} // Prevent selecting the prompt
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPromptToDelete(prompt.id);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer: Settings Button */}
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      {/* Add Prompt Dialog */}
      <Dialog open={isAddPromptOpen} onOpenChange={setIsAddPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Prompt</DialogTitle>
            <DialogDescription>
              Start a new prompt engineering session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Email Polisher"
                value={newPromptTitle}
                onChange={(e) => setNewPromptTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal">Goal</Label>
              <Textarea
                id="goal"
                placeholder="What do you want this prompt to achieve?"
                value={newPromptGoal}
                onChange={(e) => setNewPromptGoal(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Popover open={isTagsPopoverOpen} onOpenChange={setIsTagsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-9"
                  >
                    <div className="flex flex-wrap gap-1 overflow-hidden mr-2">
                      {newPromptTags.length > 0
                        ? (
                          <>
                            {newPromptTags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className=""
                              >
                                {tag}
                              </Badge>
                            ))}
                            {newPromptTags.length > 3 && (
                              <Badge variant="secondary" className="">
                                +{newPromptTags.length - 3} more
                              </Badge>
                            )}
                          </>
                        )
                        : "Select tags..."}
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Search tags..." />
                    <CommandEmpty>No tag found.</CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-48">
                        {AVAILABLE_TAGS.map((tag) => {
                          const isSelected = newPromptTags.includes(tag);
                          return (
                            <CommandItem
                              key={tag}
                              onSelect={() => {
                                setNewPromptTags(
                                  isSelected
                                    ? newPromptTags.filter((t) => t !== tag)
                                    : [...newPromptTags, tag]
                                );
                              }}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => {
                                  setNewPromptTags(
                                    isSelected
                                      ? newPromptTags.filter((t) => t !== tag)
                                      : [...newPromptTags, tag]
                                  );
                                }}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPromptOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPrompt} disabled={!newPromptTitle.trim()}>Create Prompt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!promptToDelete} onOpenChange={(open) => !open && setPromptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this prompt and all its versions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePrompt} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
