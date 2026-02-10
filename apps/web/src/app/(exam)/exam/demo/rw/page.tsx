"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { ExamShell } from "@/components/exam/ExamShell";
import { buildMockRwSection } from "@/lib/mockRwSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExamDemoRW() {
  const total = 27;
  const items = useMemo(() => buildMockRwSection(total), []);
  const [idx, setIdx] = useState(0);

  // refs to reset scroll on question change (Bluebook-like)
  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const rightScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    leftScrollRef.current?.scrollTo({ top: 0 });
    rightScrollRef.current?.scrollTo({ top: 0 });
  }, [idx]);

  const q = items[idx];

  const leftPane = (
    <div ref={leftScrollRef} className="h-full overflow-auto p-6">
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: q.paragraphHtml }} />
    </div>
  );

  const rightPane = (
    <div ref={rightScrollRef} className="h-full overflow-auto p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Question {idx + 1}</div>
        <Button variant="ghost" className="text-sm">Mark for Review (next)</Button>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-5 space-y-3">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: q.questionHtml }} />
          {q.choices.map((c) => (
            <button
              key={c.id}
              className="w-full rounded-xl border p-4 text-left hover:bg-muted/50 transition"
            >
              <div className="text-sm font-medium">{c.id}. {c.text}</div>
            </button>
          ))}
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
      leftPane={leftPane}
      rightPane={rightPane}
      mainPane={<div />}
      onJump={(i) => setIdx(i)}
      onBack={() => setIdx((v) => Math.max(0, v - 1))}
      onNext={() => setIdx((v) => Math.min(total - 1, v + 1))}
      userLabel="Varun Dhullipalla"
    />
  );
}
