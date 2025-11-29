import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "renderer/components/ui/resizable";
import { PromptSidebar } from "../components/PromptSidebar";
import { PromptDetailPane } from "../components/PromptDetailPane";

export function PromptManagerScreen() {
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
