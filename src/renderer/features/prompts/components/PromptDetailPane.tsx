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
import { Save, Copy, Clock, Pencil, Check, X, Plus, Trash2, Eye, Edit3 } from "lucide-react";
import { cn } from "renderer/lib/utils";

interface OutputSample {
  id: string;
  name: string;
  content: string;
}

export function PromptDetailPane() {
  const [isEditingName, setIsEditingName] = useState(false);
  const [promptName, setPromptName] = useState("Article Summarizer");
  const [tempPromptName, setTempPromptName] = useState(promptName);

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

  const activeSample = samples.find(s => s.id === activeSampleId);

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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4 flex-1">
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
          <Tabs defaultValue="v1" className="h-8">
            <TabsList className="h-9">
              <TabsTrigger value="v1">v1</TabsTrigger>
              <TabsTrigger value="v2">v2</TabsTrigger>
              <TabsTrigger value="new">+</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
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
            <Select defaultValue="gpt-4o">
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

        <Separator />

        {/* Editor Area */}
        <div className="grid grid-cols-2 gap-6 h-[500px]">
          {/* Prompt Editor */}
          <div className="flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Prompt</Label>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <Textarea
              className="flex-1 font-mono text-sm resize-none"
              placeholder="Enter your system prompt here..."
              defaultValue="You are a helpful assistant that summarizes text..."
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
    </div>
  );
}
