import { ReadingStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Book, BookOpen, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusFilterProps {
  readingStatuses: ReadingStatus[];
  selectedStatus: string | null;
  onSelectStatus: (statusId: string | null) => void;
}

export function StatusFilter({
  readingStatuses,
  selectedStatus,
  onSelectStatus,
}: StatusFilterProps) {
  const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    "Not started": Book,
    Reading: BookOpen,
    Finished: BookMarked,
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedStatus === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onSelectStatus(null)}
        >
          All
        </Badge>
        {readingStatuses.map((status) => {
          const Icon = statusIcons[status.status];
          return (
            <Badge
              key={status.reading_status_id}
              variant={selectedStatus === status.reading_status_id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onSelectStatus(status.reading_status_id)}
            >
              {Icon && <Icon className="w-3 h-3 mr-1" />}
              {status.status}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
