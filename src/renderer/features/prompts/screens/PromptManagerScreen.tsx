import { useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "renderer/components/ui/resizable";
import { PromptSidebar } from "../components/PromptSidebar";
import { PromptDetailPane } from "../components/PromptDetailPane";
import { IpcPromptListItem } from "shared/ipc-types";

export function PromptManagerScreen() {
  const [prompts, setPrompts] = useState<IpcPromptListItem[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setIsLoading(true);
        const fetchedPrompts = await window.promptApi.getAllPrompts();
        const safePrompts = fetchedPrompts || []; // Ensure it's an array
        setPrompts(safePrompts);
        if (safePrompts.length > 0) {
          setSelectedPromptId(safePrompts[0].id);
        } else {
          setSelectedPromptId(null);
        }
      } catch (err) {
        console.error("Failed to fetch prompts:", err);
        setError("Failed to load prompts.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrompts();
  }, []);

  const handleCreatePrompt = async (name: string, description: string, tags: string[], modelId?: string) => {
    try {
      const newPrompt = await window.promptApi.createPrompt(name, description, tags, modelId);
      setPrompts((prev) => [...prev, newPrompt]);
      setSelectedPromptId(newPrompt.id);
    } catch (err) {
      console.error("Failed to create prompt:", err);
      setError("Failed to create prompt.");
    }
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      await window.promptApi.deletePrompt(id);
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      if (selectedPromptId === id) {
        setSelectedPromptId(prompts.length > 1 ? prompts[0].id : null);
      }
    } catch (err) {
      console.error("Failed to delete prompt:", err);
      setError("Failed to delete prompt.");
    }
  };

  const handleUpdatePromptName = async (id: string, newName: string) => {
    try {
      await window.promptApi.updatePrompt(id, { name: newName });
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name: newName, lastModified: Date.now() } : p))
      );
    } catch (err) {
      console.error("Failed to update prompt name:", err);
      setError("Failed to update prompt name.");
    }
  };

  const handleUpdatePromptDescription = async (id: string, newDescription: string) => {
    try {
      await window.promptApi.updatePrompt(id, { description: newDescription });
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, description: newDescription, lastModified: Date.now() } : p))
      );
    } catch (err) {
      console.error("Failed to update prompt description:", err);
      setError("Failed to update prompt description.");
    }
  };

  const handleUpdatePromptCurrentContent = async (id: string, newContent: string) => {
    try {
      await window.promptApi.updatePrompt(id, { currentContent: newContent });
      // No need to update prompts list, as this is detail view specific
    } catch (err) {
      console.error("Failed to update prompt current content:", err);
      setError("Failed to update prompt current content.");
    }
  };

  const handleUpdatePromptCurrentModelId = async (id: string, newModelId: string) => {
    try {
      await window.promptApi.updatePrompt(id, { currentModelId: newModelId });
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, model: newModelId, lastModified: Date.now() } : p))
      ); // Update list item's model display
    } catch (err) {
      console.error("Failed to update prompt current model ID:", err);
      setError("Failed to update prompt current model ID.");
    }
  };

  const handleUpdatePromptCurrentTemperature = async (id: string, newTemperature: number) => {
    try {
      await window.promptApi.updatePrompt(id, { currentTemperature: newTemperature });
    } catch (err) {
      console.error("Failed to update prompt current temperature:", err);
      setError("Failed to update prompt current temperature.");
    }
  };

  const handleUpdatePromptCurrentTokenLimit = async (id: string, newTokenLimit: number) => {
    try {
      await window.promptApi.updatePrompt(id, { currentTokenLimit: newTokenLimit });
    } catch (err) {
      console.error("Failed to update prompt current token limit:", err);
      setError("Failed to update prompt current token limit.");
    }
  };

  const handleUpdatePromptCurrentTopK = async (id: string, newTopK: number) => {
    try {
      await window.promptApi.updatePrompt(id, { currentTopK: newTopK });
    } catch (err) {
      console.error("Failed to update prompt current Top-K:", err);
      setError("Failed to update prompt current Top-K.");
    }
  };

  const handleUpdatePromptCurrentTopP = async (id: string, newTopP: number) => {
    try {
      await window.promptApi.updatePrompt(id, { currentTopP: newTopP });
    } catch (err) {
      console.error("Failed to update prompt current Top-P:", err);
      setError("Failed to update prompt current Top-P.");
    }
  };

  const handleCreatePromptVersion = async (
    promptId: string,
    label: string,
    content: string,
    modelId: string,
    temperature: number,
    tokenLimit: number | undefined,
    topK: number | undefined,
    topP: number | undefined,
    note: string | undefined,
    isMajorVersion: boolean,
    copySamplesFromVersionId?: string,
    archivePreviousVersionId?: string,
  ) => {
    try {
      const newVersion = await window.promptApi.createPromptVersion(
        promptId,
        label,
        content,
        modelId,
        temperature,
        tokenLimit,
        topK,
        topP,
        note,
        isMajorVersion,
        copySamplesFromVersionId,
        archivePreviousVersionId
      );
      return newVersion;
    } catch (err) {
      console.error("Failed to create prompt version:", err);
      setError("Failed to create prompt version.");
      throw err;
    }
  };

  const handleCreateOutputSample = async (versionId: string, name: string, content: string) => {
    try {
      const newSample = await window.promptApi.createOutputSample(versionId, name, content);
      return newSample;
    } catch (err) {
      console.error("Failed to create output sample:", err);
      setError("Failed to create output sample.");
      throw err;
    }
  };

  const handleUpdatePromptTags = async (promptId: string, newTags: string[]) => {
    try {
      await window.promptApi.updatePromptTags(promptId, newTags);
      setPrompts((prevPrompts) =>
        prevPrompts.map((prompt) =>
          prompt.id === promptId ? { ...prompt, tags: newTags, lastModified: Date.now() } : prompt
        )
      );
    } catch (err) {
      console.error("Failed to update prompt tags:", err);
      setError("Failed to update prompt tags.");
    }
  };

  if (isLoading) {
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
          <PromptSidebar
            prompts={prompts}
            selectedPromptId={selectedPromptId}
            setSelectedPromptId={setSelectedPromptId}
            onCreatePrompt={handleCreatePrompt}
            onDeletePrompt={handleDeletePrompt}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Pane: Detail & Editor */}
        <ResizablePanel defaultSize={80}>
          <PromptDetailPane
            prompts={prompts}
            selectedPromptId={selectedPromptId}
            onUpdatePromptName={handleUpdatePromptName}
            onUpdatePromptDescription={handleUpdatePromptDescription}
            onUpdatePromptCurrentContent={handleUpdatePromptCurrentContent}
            onUpdatePromptCurrentModelId={handleUpdatePromptCurrentModelId}
            onUpdatePromptCurrentTemperature={handleUpdatePromptCurrentTemperature}
            onUpdatePromptCurrentTokenLimit={handleUpdatePromptCurrentTokenLimit}
            onUpdatePromptCurrentTopK={handleUpdatePromptCurrentTopK}
            onUpdatePromptCurrentTopP={handleUpdatePromptCurrentTopP}
            onUpdatePromptTags={handleUpdatePromptTags}
            onCreatePromptVersion={handleCreatePromptVersion}
            onCreateOutputSample={handleCreateOutputSample}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
