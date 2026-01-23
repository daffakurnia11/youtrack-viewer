import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sprint } from "@/types";

interface BoardStatsProps {
  sprint: Sprint | null;
  issuesCount: number;
  totalStoryPoints: number;
  onRefresh: () => void;
  onSettings: () => void;
  loading: boolean;
}

export function BoardStats({
  sprint,
  issuesCount,
  totalStoryPoints,
  onRefresh,
  onSettings,
  loading,
}: BoardStatsProps) {
  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex flex-1 items-center gap-2 bg-muted px-4 py-2 rounded-lg">
          <span className="text-sm font-medium">Issues: {issuesCount}</span>
        </div>
        <div className="flex flex-1 items-center gap-2 bg-muted px-4 py-2 rounded-lg">
          <span className="text-sm font-medium">Story Points: {totalStoryPoints}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onSettings}
          variant="outline"
          size="icon"
          className="cursor-pointer"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button onClick={onRefresh} className="flex-1 cursor-pointer" disabled={!sprint || loading}>
          Filter
        </Button>
      </div>
    </>
  );
}
