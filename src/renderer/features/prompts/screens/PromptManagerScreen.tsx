import { useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "renderer/components/ui/resizable";
import { PromptSidebar } from "../components/PromptSidebar";
import { PromptDetailPane } from "../components/PromptDetailPane";
import { usePromptStore } from "renderer/stores/usePromptStore";

export function PromptManagerScreen() {
  const { fetchPrompts, isLoadingPrompts, error, fetchModels } = usePromptStore();

  useEffect(() => {
    fetchPrompts();
    fetchModels();
  }, [fetchPrompts, fetchModels]);

  if (isLoadingPrompts) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-muted-foreground">
        Loading prompts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-destructive">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground">
      <ResizablePanelGroup direction="horizontal">
        {/* Left Sidebar: Prompt List */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="min-w-[250px]">
          <PromptSidebar />
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Pane: Detail & Editor */}
        <ResizablePanel defaultSize={80}>
          <PromptDetailPane />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
