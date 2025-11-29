import { Button } from "renderer/components/ui/button";
import { Input } from "renderer/components/ui/input";
import { Label } from "renderer/components/ui/label";
import { Textarea } from "renderer/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "renderer/components/ui/tabs";
import { Separator } from "renderer/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "renderer/components/ui/select";
import { Save, Play, Copy, Clock } from "lucide-react";

export function PromptDetailPane() {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4 flex-1">
          <Input
            className="text-lg font-bold border-transparent hover:border-input focus:border-input w-[300px] px-2"
            defaultValue="Article Summarizer"
          />
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

          {/* Output / Preview Area */}
          <div className="flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Output Samples</Label>
              <Button variant="secondary" size="sm" className="h-7">
                 <Play className="h-3 w-3 mr-1" /> Run
              </Button>
            </div>
             <Textarea 
              className="flex-1 font-mono text-sm resize-none bg-muted/30" 
              placeholder="Output will appear here..."
              readOnly
            />
          </div>
        </div>

      </div>
    </div>
  );
}
