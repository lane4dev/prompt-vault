import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "renderer/components/ui/resizable";
import { PromptSidebar } from "../components/PromptSidebar";
import { PromptDetailPane } from "../components/PromptDetailPane";

// Mock data for initial state
const INITIAL_PROMPTS = [
  {
    id: "1",
    name: "Article Summarizer",
    description: "Summarize news articles into bullet points.",
    tags: ["Writing", "Productivity", "Research", "Education", "Personal"],
    model: "gpt-4o",
    lastModified: "2h ago",
  },
  {
    id: "2",
    name: "Code Refactor Expert",
    description: "Refactor messy code into clean, solid patterns.",
    tags: ["Coding", "Development", "Productivity"],
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
  {
    id: "4",
    name: "Recipe Generator",
    description: "Generate creative recipes based on available ingredients.",
    tags: ["Cooking", "Creativity"],
    model: "gpt-4o-mini",
    lastModified: "5d ago",
  },
];

export function PromptManagerScreen() {
  const [prompts, setPrompts] = useState(INITIAL_PROMPTS);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>("1");

  const handleUpdatePromptTags = (promptId: string, newTags: string[]) => {
    setPrompts((prevPrompts) =>
      prevPrompts.map((prompt) =>
        prompt.id === promptId ? { ...prompt, tags: newTags } : prompt
      )
    );
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground">
      <ResizablePanelGroup direction="horizontal">
        {/* Left Sidebar: Prompt List */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="min-w-[250px]">
          <PromptSidebar
            prompts={prompts}
            setPrompts={setPrompts}
            selectedPromptId={selectedPromptId}
            setSelectedPromptId={setSelectedPromptId}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Pane: Detail & Editor */}
        <ResizablePanel defaultSize={80}>
          <PromptDetailPane
            prompts={prompts}
            selectedPromptId={selectedPromptId}
            onUpdatePromptTags={handleUpdatePromptTags}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
