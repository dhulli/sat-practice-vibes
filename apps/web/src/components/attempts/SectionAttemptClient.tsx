"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExamShell } from "@/components/exam/ExamShell";
import type { QuestionStatus } from "@/components/exam/QuestionGridModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildMockRwSection } from "@/lib/mockRwSection";
import { buildMockMathSection } from "@/lib/mockMathSection";
import type { SectionType } from "@/lib/sections";
import {
  markAttemptExited,
  markAttemptSubmitted,
  saveAttemptProgress,
} from "@/lib/attemptStore";
import { setSectionStatus } from "@/lib/sectionStatusStore";

type AttemptState = {
  currentIndex: number;
  selected: Record<number, string>;
  review: Record<number, boolean>;
};

function getStatus(i: number, s: AttemptState): QuestionStatus {
  if (i === s.currentIndex) return "current";
  if (s.review[i]) return "review";
  if (s.selected[i] && String(s.selected[i]).trim() !== "") return "answered";
  return "unanswered";
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SectionAttemptClient({
  attemptId,
  sectionId,
  sectionType,
}: {
  attemptId: string;
  sectionId: string;
  sectionType: SectionType;
}) {
  const router = useRouter();
  const total = sectionType === "RW" ? 27 : 22;
  const timeLimit = sectionType === "RW" ? 32 * 60 : 35 * 60;

  const rwItems = useMemo(() => buildMockRwSection(total), [total]);
  const mathItems = useMemo(() => buildMockMathSection(total), [total]);

  const [remainingSeconds, setRemainingSeconds] = useState(timeLimit);
  const [state, setState] = useState<AttemptState>({
    currentIndex: 0,
    selected: {},
    review: {},
  });

  const idx = state.currentIndex;
  const rwQ = rwItems[idx];
  const mathQ = mathItems[idx];

  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const rightScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    leftScrollRef.current?.scrollTo({ top: 0 });
    rightScrollRef.current?.scrollTo({ top: 0 });
  }, [idx]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          void handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const questionRefs = useMemo(() => {
    const items = sectionType === "RW" ? rwItems : mathItems;
    return Object.fromEntries(items.map((q, i) => [i, q.id]));
  }, [sectionType, rwItems, mathItems]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void saveAttemptProgress({
        attemptId,
        currentIndex: state.currentIndex,
        remainingSeconds,
        selected: state.selected,
        review: state.review,
        questionRefs,
      });
    }, 700);

    return () => window.clearTimeout(handle);
  }, [attemptId, state, remainingSeconds, questionRefs]);

  async function handleSubmit() {
    await markAttemptSubmitted(attemptId);
    setSectionStatus(sectionId, "not_started");
    router.push(`/attempts/section/${attemptId}/summary?sectionId=${encodeURIComponent(sectionId)}`);
  }

  async function handleExit() {
    await markAttemptExited(attemptId);
    setSectionStatus(sectionId, "not_started");
    router.push("/section-practice");
  }

  const statuses = useMemo(
    () => Array.from({ length: total }, (_, i) => getStatus(i, state)),
    [state, total]
  );

  if (sectionType === "RW") {
    const selected = state.selected[idx];

    const leftPane = (
      <div ref={leftScrollRef} className="h-full overflow-auto p-6">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: rwQ.paragraphHtml }} />
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
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: rwQ.questionHtml }} />

            <div className="space-y-2">
              {rwQ.choices.map((c) => {
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
                    <div className="text-sm font-semibold">
                      {c.id}. {c.text}
                    </div>
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
        title={`Section Practice: RW (${sectionId})`}
        layout="split"
        showTimer
        timeText={formatTime(remainingSeconds)}
        totalQuestions={total}
        currentIndex={idx}
        statuses={statuses}
        leftPane={leftPane}
        rightPane={rightPane}
        mainPane={<div />}
        onJump={(i) => setState((s) => ({ ...s, currentIndex: i }))}
        onBack={() =>
          setState((s) => ({
            ...s,
            currentIndex: Math.max(0, s.currentIndex - 1),
          }))
        }
        onNext={() =>
          setState((s) => ({
            ...s,
            currentIndex: Math.min(total - 1, s.currentIndex + 1),
          }))
        }
        onSubmit={() => {
          void handleSubmit();
        }}
        onExit={() => {
          void handleExit();
        }}
        userLabel="Student"
      />
    );
  }

  const selected = state.selected[idx] ?? "";

  const mainPane = (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardContent className="p-5 space-y-3">
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

          {mathQ.stimulusHtml ? (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: mathQ.stimulusHtml }} />
          ) : null}
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: mathQ.questionHtml }} />

          {mathQ.kind === "mcq" ? (
            <div className="space-y-2">
              {mathQ.choices?.map((c) => {
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
                    <div className="text-sm font-semibold">
                      {c.id}. {c.text}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-medium">Your answer (SPR)</div>
              <Input
                value={selected}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    selected: { ...s.selected, [idx]: e.target.value },
                  }))
                }
                placeholder="Enter your answer"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ExamShell
      title={`Section Practice: Math (${sectionId})`}
      layout="single"
      showTimer
      timeText={formatTime(remainingSeconds)}
      totalQuestions={total}
      currentIndex={idx}
      statuses={statuses}
      mainPane={mainPane}
      onJump={(i) => setState((s) => ({ ...s, currentIndex: i }))}
      onBack={() =>
        setState((s) => ({
          ...s,
          currentIndex: Math.max(0, s.currentIndex - 1),
        }))
      }
      onNext={() =>
        setState((s) => ({
          ...s,
          currentIndex: Math.min(total - 1, s.currentIndex + 1),
        }))
      }
      onSubmit={() => {
        void handleSubmit();
      }}
      onExit={() => {
        void handleExit();
      }}
      userLabel="Student"
    />
  );
}
