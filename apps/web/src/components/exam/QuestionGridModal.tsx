"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type QuestionStatus = "current" | "unanswered" | "answered" | "review";

type Props = {
  open: boolean;
  onClose: () => void;
  total: number;
  currentIndex: number; // 0-based
  onJump: (index: number) => void;

  // NEW
  statuses?: QuestionStatus[]; // length=total
  showSubmit?: boolean;
  onSubmit?: () => void;
};

function tileClass(status: QuestionStatus) {
  // Keep it simple & clean for now. We’ll refine later to match Bluebook even closer.
  switch (status) {
    case "current":
      return "bg-muted border border-muted-foreground/30";
    case "answered":
      return "bg-background border border-border";
    case "review":
      return "bg-background border-2 border-rose-500/70";
    case "unanswered":
    default:
      return "bg-background border border-dashed border-muted-foreground/40";
  }
}

export function QuestionGridModal({
  open,
  onClose,
  total,
  currentIndex,
  onJump,
  statuses,
  showSubmit,
  onSubmit,
}: Props) {
  const unresolvedCount = useMemo(() => {
    if (!statuses) return 0;
    return statuses.filter((s) => s === "unanswered").length;
  }, [statuses]);
  
  if (!open) return null; 

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Section Questions</CardTitle>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-muted border border-muted-foreground/30" />
              Current
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-background border border-dashed border-muted-foreground/40" />
              Unanswered
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-background border border-border" />
              Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-background border-2 border-rose-500/70" />
              For Review
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: total }, (_, i) => {
              const status: QuestionStatus =
                statuses?.[i] ??
                (i === currentIndex ? "current" : "unanswered");

              return (
                <button
                  key={i}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-semibold",
                    "hover:bg-muted/40 transition",
                    tileClass(status),
                  ].join(" ")}
                  onClick={() => {
                    onJump(i);
                    onClose();
                  }}
                  aria-label={`Question ${i + 1}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Footer actions */}
          {showSubmit ? (
            <div className="space-y-3">
              {unresolvedCount > 0 ? (
                <div className="rounded-xl border p-3 text-sm">
                  <div className="font-semibold">Check your work</div>
                  <div className="text-muted-foreground">
                    You have <span className="font-medium text-foreground">{unresolvedCount}</span>{" "}
                    unanswered question{unresolvedCount === 1 ? "" : "s"}.
                    You can still submit, but you may want to review first.
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border p-3 text-sm">
                  <div className="font-semibold">All questions answered</div>
                  <div className="text-muted-foreground">
                    You can submit the section when ready.
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>Keep Working</Button>
                <Button onClick={onSubmit}>Submit Section</Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
