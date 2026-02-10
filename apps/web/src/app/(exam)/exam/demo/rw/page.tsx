"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExamShell } from "@/components/exam/ExamShell";
import type { QuestionStatus } from "@/components/exam/QuestionGridModal";
import { buildMockRwSection } from "@/lib/mockRwSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AttemptState = {
  currentIndex: number;
  selected: Record<number, string>; // index -> "A"/"B"/...
  review: Record<number, boolean>;  // index -> flagged
};

function getStatus(i: number, s: AttemptState): QuestionStatus {
  if (i === s.currentIndex) return "current";
  if (s.review[i]) return "review";
  if (s.selected[i] && String(s.selected[i]).trim() !== "") return "answered";
  return "unanswered";
}

export default function ExamDemoRW() {
  const total = 27;
  const items = useMemo(() => buildMockRwSection(total), []);

  const [state, setState] = useState<AttemptState>({
    currentIndex: 0,
    selected: {},
    review: {},
  });

  const idx = state.currentIndex;
  const q = items[idx];

  // refs to reset scroll on question change (Bluebook-like)
  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const rightScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    leftScrollRef.current?.scrollTo({ top: 0 });
    rightScrollRef.current?.scrollTo({ top: 0 });
  }, [idx]);

  const statuses = useMemo(
    () => Array.from({ length: total }, (_, i) => getStatus(i, state)),
    [state, total]
  );

  const selected = state.selected[idx];

  const leftPane = (
    <div ref={leftScrollRef} className="h-full overflow-auto p-6">
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: q.paragraphHtml }} />
    </div>
  );

  const rightPane = (
    <div ref={rightScrollRef} className="h-full overflow-auto p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Question {idx + 1}</div>

        <Button
          variant="ghost"
          className="text-sm"
          onClick={() =>
            setState((s) => ({
              ...s,
              review: { ...s.review, [idx]: !s.review[idx] },
            }))
          }
        >
          {state.review[idx] ? "✅ For Review" : "Mark for Review"}
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-5 space-y-3">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: q.questionHtml }} />

          <div className="space-y-2">
            {q.choices.map((c) => {
              const isSel = selected === c.id;
              return (
                <button
                  key={c.id}
                  className={[
                    "w-full rounded-xl border p-4 text-left transition",
                    isSel ? "bg-muted border-muted-foreground/30" : "hover:bg-muted/50",
                  ].join(" ")}
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      selected: { ...s.selected, [idx]: c.id },
                    }))
                  }
                >
                  <div className="text-sm font-semibold">{c.id}. {c.text}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ExamShell
      title="Section 1: Reading and Writing"
      layout="split"
      showTimer
      timeText="28:00"
      totalQuestions={total}
      currentIndex={idx}
      statuses={statuses}
      leftPane={leftPane}
      rightPane={rightPane}
      mainPane={<div />}
      onJump={(i) => setState((s) => ({ ...s, currentIndex: i }))}
      onBack={() => setState((s) => ({ ...s, currentIndex: Math.max(0, s.currentIndex - 1) }))}
      onNext={() => setState((s) => ({ ...s, currentIndex: Math.min(total - 1, s.currentIndex + 1) }))}
      onSubmit={() => {
        // later: go to summary route
        alert("Submitted RW Section (mock)");
      }}
      userLabel="Varun Dhullipalla"
    />
  );
}
