"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExamShell } from "@/components/exam/ExamShell";
import type { QuestionStatus } from "@/components/exam/QuestionGridModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SectionType } from "@/lib/sections";
import {
  markAttemptExited,
  markAttemptSubmitted,
  saveAttemptProgress,
} from "@/lib/attemptStore";
import { setSectionStatus } from "@/lib/sectionStatusStore";

type ApiChoice = { id: string; textHtml: string };

type ApiQuestion = {
  id: string;
  questionType: string; // e.g., "MCQ" | "SPR" | etc (depends on your DB)
  passageHtml: string | null; // RW passage / Math stimulus (optional)
  questionHtml: string;
  assetUrl: string | null;
  choices: ApiChoice[]; // empty for SPR
};

type AttemptLoad = {
  attempt: {
    id: string;
    status: string;
    sectionType: "RW" | "MATH";
    currentIndex: number;
    remainingSeconds: number;
    selected: Record<string, string>;
    review: Record<string, boolean>;
  };
  practiceSection: { code: string; name: string; durationSec: number; type: "RW" | "MATH" };
  questions: ApiQuestion[];
};

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

function toNumberKeyMap<T>(obj: Record<string, T> | null | undefined): Record<number, T> {
  const out: Record<number, T> = {};
  if (!obj) return out;
  for (const [k, v] of Object.entries(obj)) {
    const n = Number(k);
    if (!Number.isNaN(n)) out[n] = v;
  }
  return out;
}

function isMathSpr(q: ApiQuestion): boolean {
  // Prefer explicit type if you have it. Otherwise: no choices => SPR-like.
  const t = (q.questionType ?? "").toLowerCase();
  if (t.includes("spr") || t.includes("grid") || t.includes("free")) return true;
  return !q.choices || q.choices.length === 0;
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

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [timeLimit, setTimeLimit] = useState(sectionType === "RW" ? 32 * 60 : 35 * 60);

  const [remainingSeconds, setRemainingSeconds] = useState(timeLimit);
  const [state, setState] = useState<AttemptState>({
    currentIndex: 0,
    selected: {},
    review: {},
  });

  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const rightScrollRef = useRef<HTMLDivElement | null>(null);

  // Load attempt + questions from DB
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      const res = await fetch(`/api/section-attempts/${attemptId}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load attempt/questions");

      const data = (await res.json()) as AttemptLoad;
      if (!alive) return;

      setQuestions(data.questions ?? []);

      const dur = Number(data.practiceSection?.durationSec ?? 0);
      const effectiveTimeLimit = dur > 0 ? dur : sectionType === "RW" ? 32 * 60 : 35 * 60;
      setTimeLimit(effectiveTimeLimit);

      const rs = Number(data.attempt?.remainingSeconds ?? 0);
      setRemainingSeconds(rs > 0 ? rs : effectiveTimeLimit);

      setState({
        currentIndex: Number(data.attempt?.currentIndex ?? 0) || 0,
        selected: toNumberKeyMap<string>(data.attempt?.selected),
        review: toNumberKeyMap<boolean>(data.attempt?.review),
      });

      setLoading(false);
    })().catch(() => {
      if (!alive) return;
      setLoading(false);
      alert("Could not load section from DB. Check API / DB seed.");
    });

    return () => {
      alive = false;
    };
  }, [attemptId, sectionType]);

  const total = questions.length;
  const idx = Math.min(state.currentIndex, Math.max(0, total - 1));
  const q = questions[idx];

  // Reset scroll on question change
  useEffect(() => {
    leftScrollRef.current?.scrollTo({ top: 0 });
    rightScrollRef.current?.scrollTo({ top: 0 });
  }, [idx]);

  // Timer (starts after load so we don’t auto-submit while still loading)
  useEffect(() => {
    if (loading) return;
    if (total === 0) return;

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
  }, [loading, total]);

  // Map question index -> question UUID (for answer upserts)
  const questionRefs = useMemo(() => {
    return Object.fromEntries((questions ?? []).map((qq, i) => [i, qq.id]));
  }, [questions]);

  // Autosave
  useEffect(() => {
    if (loading) return;
    if (total === 0) return;

    const handle = window.setTimeout(() => {
      void saveAttemptProgress({
        attemptId,
        currentIndex: idx,
        remainingSeconds,
        selected: state.selected,
        review: state.review,
        questionRefs,
      });
    }, 700);

    return () => window.clearTimeout(handle);
  }, [attemptId, idx, state.selected, state.review, remainingSeconds, questionRefs, loading, total]);

  async function handleSubmit() {
    await markAttemptSubmitted(attemptId);
    setSectionStatus(sectionId, "not_started");
    router.push(
      `/attempts/section/${attemptId}/summary?sectionId=${encodeURIComponent(sectionId)}`
    );
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

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading section…</div>;
  }

  if (!q || total === 0) {
    return (
      <div className="p-6 space-y-3">
        <div className="text-sm text-muted-foreground">No questions found for this section.</div>
        <Button onClick={() => router.push("/section-practice")}>Back</Button>
      </div>
    );
  }

  // ---------- RW UI ----------
  if (sectionType === "RW") {
    const selected = state.selected[idx];

    const leftPane = (
      <div ref={leftScrollRef} className="h-full overflow-auto p-6">
        {q.passageHtml ? (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: q.passageHtml }} />
        ) : (
          <div className="text-sm text-muted-foreground">No passage.</div>
        )}
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
              {(q.choices ?? []).map((c) => {
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
                      {c.id}.{" "}
                      <span dangerouslySetInnerHTML={{ __html: c.textHtml }} />
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
        onSubmit={() => void handleSubmit()}
        onExit={() => void handleExit()}
        userLabel="Student"
      />
    );
  }

  // ---------- Math UI ----------
  const selected = state.selected[idx] ?? "";
  const spr = isMathSpr(q);

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

          {q.passageHtml ? (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: q.passageHtml }} />
          ) : null}

          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: q.questionHtml }} />

          {!spr ? (
            <div className="space-y-2">
              {(q.choices ?? []).map((c) => {
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
                      {c.id}.{" "}
                      <span dangerouslySetInnerHTML={{ __html: c.textHtml }} />
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
      onSubmit={() => void handleSubmit()}
      onExit={() => void handleExit()}
      userLabel="Student"
    />
  );
}