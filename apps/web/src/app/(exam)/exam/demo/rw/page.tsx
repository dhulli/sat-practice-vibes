"use client";

import { useState } from "react";
import { ExamShell } from "@/components/exam/ExamShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PASSAGE_HTML = `
  <p>The artisans of the Igun Eronmwon guild in Benin City, Nigeria, typically _____ the bronze- and brass-casting techniques that have been passed down through their families since the thirteenth century...</p>
`;

export default function ShellDemoRW() {
  const total = 27;
  const [idx, setIdx] = useState(0);
  const [marked, setMarked] = useState(false);

  const leftPane = (
    <div className="p-6">
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: PASSAGE_HTML }} />
    </div>
  );

  const rightPane = (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Question {idx + 1}</div>

        <Button
          variant="ghost"
          className="text-sm"
          onClick={() => setMarked((v) => !v)}
        >
          {marked ? "✅ For Review" : "Mark for Review"}
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-5 space-y-3">
          <div className="text-base font-medium">
            Which choice completes the text with the most logical and precise word or phrase?
          </div>

          {["experiment with", "adhere to", "improve on", "grapple with"].map((t, i) => (
            <button
              key={i}
              className="w-full rounded-xl border p-4 text-left hover:bg-muted/50 transition"
            >
              <div className="text-sm font-medium">{String.fromCharCode(65 + i)}. {t}</div>
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
      mainPane={<div />} // unused in split
      onJump={(i) => setIdx(i)}
      onBack={() => setIdx((v) => Math.max(0, v - 1))}
      onNext={() => setIdx((v) => Math.min(total - 1, v + 1))}
      userLabel="Varun Dhullipalla"
    />
  );
}
