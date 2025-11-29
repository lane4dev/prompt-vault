import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "renderer/components/ui/sheet";
import { ScrollArea } from "renderer/components/ui/scroll-area";
import { Badge } from "renderer/components/ui/badge";

interface HistoryEntry {
  id: string;
  version: string;
  timestamp: string;
  changeType: "create" | "update" | "delete";
  summary: string;
}

// Mock Data
const MOCK_HISTORY: HistoryEntry[] = [
  { id: "1", version: "v2", timestamp: "Today, 10:23 AM", changeType: "update", summary: "Updated temperature and system prompt" },
  { id: "2", version: "v1", timestamp: "Yesterday, 4:50 PM", changeType: "create", summary: "Initial version created" },
];

interface PromptHistorySidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromptHistorySidebar({ open, onOpenChange }: PromptHistorySidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Version History</SheetTitle>
          <SheetDescription>
            View past changes and revert to previous versions.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-100px)] mt-6 pr-4">
          <div className="relative border-l border-muted ml-3 space-y-6">
            {MOCK_HISTORY.map((entry) => (
              <div key={entry.id} className="ml-6 relative">
                <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-2">
                     <span className="font-semibold text-sm">{entry.timestamp}</span>
                     <Badge variant="outline" className="text-xs py-0 h-5">{entry.version}</Badge>
                   </div>
                   <p className="text-sm text-muted-foreground">{entry.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
