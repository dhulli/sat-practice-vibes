"use client";

import { Button } from "@/components/ui/button";

type Props = {
  userLabel?: string;
  current: number; // 1-based
  total: number;
  onOpenGrid: () => void;
  onBack: () => void;
  onNext: () => void;
  backDisabled?: boolean;
  nextDisabled?: boolean;
};

export function BottomBar({
  userLabel = "User (mock)",
  current,
  total,
  onOpenGrid,
  onBack,
  onNext,
  backDisabled,
  nextDisabled,
}: Props) {
  return (
    <div className="h-16 border-t bg-muted/30 flex items-center justify-between px-4">
      <div className="text-sm font-medium">{userLabel}</div>

      <Button variant="secondary" onClick={onOpenGrid}>
        Question {current} of {total}
      </Button>

      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onBack} disabled={backDisabled}>
          Back
        </Button>
        <Button onClick={onNext} disabled={nextDisabled}>
          Next
        </Button>
      </div>
    </div>
  );
}
