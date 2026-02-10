"use client";

import { useState } from "react";
import { ExamShell } from "@/components/exam/ExamShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ShellDemoMath() {
  const total = 22;
  const [idx, setIdx] = useState(0);
  const [spr, setSpr] = useState("");

  const mainPane = (
    <div className="space-y-4">
      {/* Stimulus (optional): passage/graph/table - shown first */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Stimulus (optional)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          For Math, if there is a graph/passage/table it appears above the question.
          (We will render graph images from S3 later.)
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Question {idx + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-base font-medium">
            If x + 7 = 12, what is x?
          </div>

          {/* SPR example */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Your answer (SPR)</div>
            <Input value={spr} onChange={(e) => setSpr(e.target.value)} placeholder="Enter your answer" />
          </div>

          {/* MCQ example (later switch based on question kind) */}
          <div className="text-sm text-muted-foreground">
            (If MCQ, we render options instead of the textbox.)
          </div>

          <Button variant="secondary">Mark for Review (later)</Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ExamShell
      title="Section 2: Math"
      layout="single"
      showTimer
      timeText="35:00"
      totalQuestions={total}
      currentIndex={idx}
      mainPane={mainPane}
      onJump={(i) => setIdx(i)}
      onBack={() => setIdx((v) => Math.max(0, v - 1))}
      onNext={() => setIdx((v) => Math.min(total - 1, v + 1))}
      userLabel="Varun Dhullipalla"
    />
  );
}
