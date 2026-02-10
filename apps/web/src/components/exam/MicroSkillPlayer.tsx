"use client";

import { useMemo, useState } from "react";
import { MicroSkillShell } from "@/components/exam/MicroSkillShell";
import { buildMockSkillQuestions } from "@/lib/mockSkillQuestions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function strip(s: string) {
  return s.trim();
}

function renderHtml(html: string) {
  return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}

type CycleAnswer = {
  userAnswer: string;
  correct: boolean;
};

type State = {
  cycle: number;              // 1, 2, 3...
  queue: number[];            // question indexes for the current cycle (order matters)
  pos: number;                // position within queue
  nextQueue: number[];        // missed questions this cycle, in order they were missed
  answers: Record<number, CycleAnswer>; // latest attempt result per question index
  mastered: Record<number, boolean>;    // mastered if ever answered correct at least once (cumulative)
  checked: boolean;           // current question checked (locks changes)
};

export function MicroSkillPlayer({ skillId }: { skillId: string }) {
  const total = 30;
  const questions = useMemo(() => buildMockSkillQuestions(skillId, total), [skillId]);

  const [s, setS] = useState<State>(() => ({
    cycle: 1,
    queue: Array.from({ length: total }, (_, i) => i),
    pos: 0,
    nextQueue: [],
    answers: {},
    mastered: {},
    checked: false,
  }));

  // If fully mastered, show completion screen
  const masteredCount = Object.values(s.mastered).filter(Boolean).length;
  const masteryPct = Math.round((masteredCount / total) * 100);

  if (masteredCount >= total) {
    return (
      <MicroSkillShell
        title={`Micro-skill Practice: ${skillId}`}
        userLabel="Varun Dhullipalla"
        leftPane={<div className="p-6 text-sm text-muted-foreground">Complete</div>}
        rightPane={
          <div className="h-full overflow-auto p-6">
            <Card className="rounded-2xl">
              <CardContent className="p-6 space-y-3">
                <div className="text-2xl font-semibold">🎉 Micro-skill mastered</div>
                <div className="text-sm text-muted-foreground">
                  Skill: <span className="font-medium text-foreground">{skillId}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Mastery: <span className="font-medium text-foreground">100%</span> • Cycles:{" "}
                  <span className="font-medium text-foreground">{s.cycle}</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    onClick={() =>
                      setS({
                        cycle: 1,
                        queue: Array.from({ length: total }, (_, i) => i),
                        pos: 0,
                        nextQueue: [],
                        answers: {},
                        mastered: {},
                        checked: false,
                      })
                    }
                  >
                    Restart
                  </Button>

                  <Button variant="secondary" asChild>
                    <a href="/micro-skill-practice">Back to skills</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        }
      />
    );
  }

  // Current question in current cycle
  const qIndex = s.queue[s.pos];
  const q = questions[qIndex];

  const currentAnswer = s.answers[qIndex]?.userAnswer ?? "";

  const cycleTotal = s.queue.length;
  const cycleCurrent = s.pos + 1;

  const remainingToMaster = total - masteredCount;

  function setAnswer(v: string) {
    if (s.checked) return; // lock after check
    setS((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [qIndex]: {
          userAnswer: v,
          correct: prev.answers[qIndex]?.correct ?? false,
        },
      },
    }));
  }

  function doCheck() {
    const user = strip(currentAnswer);
    if (!user) return;

    const correct =
      q.kind === "mcq"
        ? user.toUpperCase() === q.correctAnswer.toUpperCase()
        : user === q.correctAnswer;

    setS((prev) => {
      const alreadyQueued = prev.nextQueue.includes(qIndex);
      const shouldQueue = !correct && !alreadyQueued;

      return {
        ...prev,
        checked: true,
        answers: {
          ...prev.answers,
          [qIndex]: { userAnswer: user, correct },
        },
        mastered: correct ? { ...prev.mastered, [qIndex]: true } : prev.mastered,
        nextQueue: shouldQueue ? [...prev.nextQueue, qIndex] : prev.nextQueue,
      };
    });
  }

  function goNext() {
    // Must Check before Next
    if (!s.checked) return;

    // More questions left in this cycle
    if (s.pos < s.queue.length - 1) {
      setS((prev) => ({ ...prev, pos: prev.pos + 1, checked: false }));
      return;
    }

    // End of cycle: if missed questions exist, start next cycle with only those
    if (s.nextQueue.length > 0) {
      setS((prev) => ({
        ...prev,
        cycle: prev.cycle + 1,
        queue: prev.nextQueue,
        pos: 0,
        nextQueue: [],
        checked: false,
      }));
      return;
    }

    // End of cycle and no misses: but we might not be fully mastered if content changed.
    // In practice, if no misses and queue contained all remaining, mastery will hit 100.
    // Still safe-guard: restart with full set of not-mastered questions if needed.
    const notMastered = Array.from({ length: total }, (_, i) => i).filter((i) => !s.mastered[i]);
    if (notMastered.length > 0) {
      setS((prev) => ({
        ...prev,
        cycle: prev.cycle + 1,
        queue: notMastered,
        pos: 0,
        nextQueue: [],
        checked: false,
      }));
    }
  }

  const leftPane = (
    <div className="h-full overflow-auto p-6">
      {q.passageHtml ? (
        renderHtml(q.passageHtml)
      ) : (
        <div className="text-sm text-muted-foreground">No stimulus</div>
      )}
    </div>
  );

  const rightPane = (
    <div className="h-full overflow-auto p-6 space-y-4">
      {/* Mastery HUD */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">Mastery</div>
            <div className="text-2xl font-semibold tabular-nums">{masteryPct}%</div>
          </div>

          <div className="text-sm text-muted-foreground">
            Mastered:{" "}
            <span className="font-medium text-foreground">
              {masteredCount}/{total}
            </span>
            {"  "}•{"  "}
            Remaining:{" "}
            <span className="font-medium text-foreground">{remainingToMaster}</span>
          </div>

          <div className="text-sm text-muted-foreground">
            Cycle{" "}
            <span className="font-medium text-foreground">{s.cycle}</span>
            {"  "}•{"  "}
            Q{" "}
            <span className="font-medium text-foreground">
              {cycleCurrent}/{cycleTotal}
            </span>
            {s.nextQueue.length > 0 ? (
              <>
                {"  "}•{"  "}
                Missed this cycle:{" "}
                <span className="font-medium text-foreground">{s.nextQueue.length}</span>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="rounded-2xl">
        <CardContent className="p-5 space-y-3">
          {renderHtml(q.questionHtml)}

          {/* Answer UI */}
          {q.kind === "mcq" && q.choices ? (
            <div className="space-y-2">
              {q.choices.map((c) => {
                const isSel = currentAnswer === c.id;
                return (
                  <button
                    key={c.id}
                    className={[
                      "w-full rounded-xl border p-4 text-left transition",
                      isSel ? "bg-muted border-muted-foreground/30" : "hover:bg-muted/50",
                    ].join(" ")}
                    onClick={() => setAnswer(c.id)}
                  >
                    <div className="text-sm font-semibold">
                      {c.id}. <span className="font-normal">{renderHtml(c.textHtml)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-medium">Your answer (SPR)</div>
              <Input
                value={currentAnswer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
                disabled={s.checked}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={doCheck} disabled={!strip(currentAnswer) || s.checked}>
              Check
            </Button>
            <Button variant="secondary" onClick={goNext} disabled={!s.checked}>
              Next
            </Button>
          </div>

          {/* Feedback */}
          {s.checked ? (
            <div className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  {s.answers[qIndex]?.correct ? "✅ Correct" : "❌ Incorrect"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Correct answer: <span className="font-mono">{q.correctAnswer}</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Complexity</div>
                <div className="text-sm text-muted-foreground">{q.complexity}</div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Complexity reason</div>
                {renderHtml(q.complexityReasonHtml)}
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Explanation</div>
                {renderHtml(q.explanationHtml)}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Optional: small hint about cycle transitions */}
      {s.pos === s.queue.length - 1 ? (
        <div className="text-xs text-muted-foreground">
          After you check this question and press Next, you’ll either start the review cycle for missed questions or finish the skill.
        </div>
      ) : null}
    </div>
  );

  return (
    <MicroSkillShell
      title={`Micro-skill Practice: ${skillId}`}
      userLabel="Varun Dhullipalla"
      leftPane={leftPane}
      rightPane={rightPane}
    />
  );
}
