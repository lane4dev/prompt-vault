import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "renderer/components/ui/sheet";
import { ScrollArea } from "renderer/components/ui/scroll-area";
import { Badge } from "renderer/components/ui/badge";
import { IpcPromptVersion } from "shared/ipc-types";

interface PromptHistorySidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: IpcPromptVersion[];
}

export function PromptHistorySidebar({ open, onOpenChange, versions }: PromptHistorySidebarProps) {
  // Sort versions by creation time descending
  const sortedVersions = [...versions].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Version History</SheetTitle>
          <SheetDescription>
            View past changes and snapshots.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-100px)] mt-6 pr-4">
          <div className="relative border-l border-muted ml-3 space-y-6">
            {sortedVersions.length === 0 ? (
              <div className="ml-6 text-sm text-muted-foreground">No history available.</div>
            ) : (
              sortedVersions.map((version) => (
                <div key={version.id} className="ml-6 relative">
                  <span className={cn(
                    "absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-background",
                    version.isMajorVersion ? "bg-primary" : "bg-muted-foreground"
                  )} />
                  <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-2">
                       <span className="font-semibold text-sm">
                         {new Date(version.createdAt).toLocaleString()}
                       </span>
                       <Badge variant={version.isMajorVersion ? "default" : "secondary"} className="text-xs py-0 h-5">
                         {version.label}
                       </Badge>
                     </div>
                     <p className="text-sm text-muted-foreground">
                       {version.note || (version.isMajorVersion ? "Major Version" : "Snapshot")}
                     </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

import { cn } from "renderer/lib/utils";
