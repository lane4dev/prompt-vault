import { Search, Plus, Tag } from "lucide-react";
import { Button } from "renderer/components/ui/button";
import { Input } from "renderer/components/ui/input";
import { ScrollArea } from "renderer/components/ui/scroll-area";
import { Badge } from "renderer/components/ui/badge";
import { cn } from "renderer/lib/utils";

// Dummy data for static UI
const MOCK_PROMPTS = [
  {
    id: "1",
    name: "Article Summarizer",
    lastModified: "2h ago",
    tags: ["Writing", "Productivity"],
    model: "gpt-4o",
  },
  {
    id: "2",
    name: "Code Refactor Expert",
    lastModified: "1d ago",
    tags: ["Coding"],
    model: "claude-3.5-sonnet",
  },
  {
    id: "3",
    name: "Email Polisher",
    lastModified: "3d ago",
    tags: ["Communication"],
    model: "gpt-4o-mini",
  },
];

interface PromptSidebarProps {
  className?: string;
}

export function PromptSidebar({ className }: PromptSidebarProps) {
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
          {MOCK_PROMPTS.map((prompt) => (
            <div
              key={prompt.id}
              className="flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent cursor-pointer"
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{prompt.name}</div>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {prompt.lastModified}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Model: {prompt.model}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-1 py-0 text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
