"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  open: boolean;
  onClose: () => void;
  total: number;
  currentIndex: number; // 0-based
  onJump: (index: number) => void;
};

export function QuestionGridModal({ open, onClose, total, currentIndex, onJump }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Questions</CardTitle>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: total }, (_, i) => {
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={i}
                  className={[
                    "rounded-xl border px-3 py-2 text-sm font-medium",
                    isCurrent ? "bg-muted" : "bg-background hover:bg-muted/50",
                  ].join(" ")}
                  onClick={() => {
                    onJump(i);
                    onClose();
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Go to Review Page (later)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
