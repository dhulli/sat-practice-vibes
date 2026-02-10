"use client";

import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  showTimer?: boolean;
  timeText?: string;          // e.g., "28:00"
  onToggleDirections?: () => void;
};

export function TopBar({ title, showTimer, timeText, onToggleDirections }: Props) {
  return (
    <div className="h-14 border-b bg-muted/30 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="font-semibold">{title}</div>
        <Button variant="ghost" className="text-sm" onClick={onToggleDirections}>
          Directions ▾
        </Button>
      </div>

      <div className="flex items-center gap-3">
        {showTimer ? (
          <div className="text-xl font-semibold tabular-nums">{timeText ?? "--:--"}</div>
        ) : (
          <div className="text-sm text-muted-foreground">Untimed</div>
        )}

        <Button variant="ghost" className="text-sm">Highlights & Notes</Button>
        <Button variant="ghost" className="text-sm">More</Button>
      </div>
    </div>
  );
}
