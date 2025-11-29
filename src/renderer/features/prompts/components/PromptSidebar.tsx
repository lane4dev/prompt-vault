import { useState } from "react";
import { Button } from "renderer/components/ui/button";
import { Input } from "renderer/components/ui/input";
import { ScrollArea } from "renderer/components/ui/scroll-area";
import { Badge } from "renderer/components/ui/badge";
import { Separator } from "renderer/components/ui/separator";
import { Search, Plus, Filter, Folder, Hash, Settings, MoreHorizontal, Trash2 } from "lucide-react";
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

interface PromptSidebarProps {
  className?: string;
}

// Mock data moved inside component state for interactivity
const INITIAL_PROMPTS = [
  {
    id: "1",
    name: "Article Summarizer",
    description: "Summarize news articles into bullet points.",
    tags: ["Writing", "Productivity"],
    model: "gpt-4o",
    lastModified: "2h ago",
  },
  {
    id: "2",
    name: "Code Refactor Expert",
    description: "Refactor messy code into clean, solid patterns.",
    tags: ["Coding", "Development"],
    model: "claude-3.5-sonnet",
    lastModified: "1d ago",
  },
  {
    id: "3",
    name: "Email Polisher",
    description: "Make emails sound more professional.",
    tags: ["Writing", "Business"],
    model: "gpt-4o",
    lastModified: "3d ago",
  },
];

export function PromptSidebar({ className }: PromptSidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prompts, setPrompts] = useState(INITIAL_PROMPTS);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>("1");
  const [promptToDelete, setPromptToDelete] = useState<string | null>(null);

  const handleDeletePrompt = () => {
    if (promptToDelete) {
      setPrompts(prompts.filter((p) => p.id !== promptToDelete));
      if (selectedPromptId === promptToDelete) {
        setSelectedPromptId(null);
      }
      setPromptToDelete(null);
    }
  };

  return (
    <div className={cn("flex flex-col h-full border-r bg-muted/10", className)}>
      {/* Header: Search & Add */}
      <div className="p-4 space-y-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Prompts</h2>
          <Button size="icon" variant="ghost">
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
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-1 py-0 text-[10px]">
                    {tag}
                  </Badge>
                ))}
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
