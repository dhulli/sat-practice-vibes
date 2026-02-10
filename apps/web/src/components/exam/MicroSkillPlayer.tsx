"use client";

import { useMemo, useState } from "react";
import { ExamShell } from "@/components/exam/ExamShell";
import type { QuestionStatus } from "@/components/exam/QuestionGridModal";
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
  cycle: number;              // 1,2,3...
  queue: number[];            // question indexes in current cycle order
  pos: number;                // position within queue
  nextQueue: number[];        // incorrect questions to redo next cycle (order of miss)
  answers: Record<number, CycleAnswer>; // latest attempt result per question index
  review: Record<number, boolean>;      // optional flag
  checked: boolean;           // whether current question is checked (locks it)
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
    review: {},
    checked: false,
  }));

  const qIndex = s.queue[s.pos];
  const q = questions[qIndex];
  const currentAnswer = s.answers[qIndex]?.userAnswer ?? "";

  const mastered = s.queue.length === 0; // not used, but kept for safety

  // Statuses are for the current cycle queue
  const statuses: QuestionStatus[] = useMemo(() => {
    return s.queue.map((qi, i) => {
      if (i === s.pos) return "current";
      if (s.review[qi]) return "review";
      if (s.answers[qi]?.userAnswer && strip(s.answers[qi]!.userAnswer)) return "answered";
      return "unanswered";
    });
  }, [s.queue, s.pos, s.review, s.answers]);

  const cycleTotal = s.queue.length;
  const cycleCurrent = s.pos + 1;

  const totalAnsweredSoFar = Object.keys(s.answers).length;
  const totalCorrectSoFar = Object.values(s.answers).filter((a) => a.correct).length;
  const accuracyPct = totalAnsweredSoFar > 0 ? Math.round((totalCorrectSoFar / totalAnsweredSoFar) * 100) : 0;

  function setAnswer(v: string) {
    if (s.checked) return; // lock after Check in this attempt
    setS((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [qIndex]: { userAnswer: v, correct: prev.answers[qIndex]?.correct ?? false },
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
        nextQueue: shouldQueue ? [...prev.nextQueue, qIndex] : prev.nextQueue,
      };
    });
  }

  function goNext() {
    // Do not allow Next unless checked for current question
    if (!s.checked) return;

    // If there are more questions in this cycle
    if (s.pos < s.queue.length - 1) {
      setS((prev) => ({ ...prev, pos: prev.pos + 1, checked: false }));
      return;
    }

    // End of this cycle: if mistakes exist, start a new cycle with only incorrect questions
    if (s.nextQueue.length > 0) {
      setS((prev) => ({
        ...prev,
        cycle: prev.cycle + 1,
        queue: prev.nextQueue,
        pos: 0,
        nextQueue: [],
        checked: false,
        // NOTE: we keep answers so progress/accuracy is visible,
        // but correctness will update as they retry in later cycles.
      }));
      return;
    }

    // Mastered: show completion screen by setting queue empty
    setS((prev) => ({
      ...prev,
      queue: [],
      pos: 0,
      checked: false,
    }));
  }

  function goBack() {
    // Allow back within current cycle but do not allow changing answer after check
    setS((prev) => ({ ...prev, pos: Math.max(0, prev.pos - 1), checked: prev.checked }));
  }

  // Completion screen
  if (s.queue.length === 0) {
    const mainDone = (
      <div className="h-full overflow-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-4">
          <Card className="rounded-2xl">
            <CardContent className="p-6 space-y-2">
              <div className="text-2xl font-semibold">🎉 Micro-skill mastered</div>
              <div className="text-sm text-muted-foreground">
                Skill: <span className="font-medium text-foreground">{skillId}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Accuracy: <span className="font-medium text-foreground">100%</span> • Cycles:{" "}
                <span className="font-medium text-foreground">{s.cycle}</span>
              </div>
              <div className="pt-2 flex gap-2">
                <Button
                  onClick={() =>
                    setS({
                      cycle: 1,
                      queue: Array.from({ length: total }, (_, i) => i),
                      pos: 0,
                      nextQueue: [],
                      answers: {},
                      review: {},
                      checked: false,
                    })
                  }
                >
                  Restart
                </Button>
                <Button variant="secondary" asChild>
                  <a href="/micro-skill-practice">Back to Skills</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );

    return (
      <ExamShell
        title={`Micro-skill Practice: ${skillId}`}
        layout="single"
        showTimer={false}
        totalQuestions={1}
        currentIndex={0}
        mainPane={mainDone}
        onJump={() => {}}
        onBack={() => {}}
        onNext={() => {}}
        interceptLastNext={false}
        userLabel="Varun Dhullipalla"
      />
    );
  }

  // Split panes for micro-skill (like RW)
  const leftPane = (
    <div className="h-full overflow-auto p-6">
      {q.passageHtml ? renderHtml(q.passageHtml) : <div className="text-sm text-muted-foreground">No stimulus</div>}
    </div>
  );

  const rightPane = (
    <div className="h-full overflow-auto p-6 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">
          Cycle {s.cycle} • Question {cycleCurrent} of {cycleTotal}
        </div>

        <Button
          variant="ghost"
          className="text-sm"
          onClick={() => setS((prev) => ({ ...prev, review: { ...prev.review, [qIndex]: !prev.review[qIndex] } }))}
        >
          {s.review[qIndex] ? "✅ For Review" : "Mark for Review"}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        Overall accuracy: <span className="font-medium text-foreground">{accuracyPct}%</span>{" "}
        {s.nextQueue.length > 0 ? (
          <>
            • Remaining to revisit (this cycle):{" "}
            <span className="font-medium text-foreground">{s.nextQueue.length}</span>
          </>
        ) : null}
      </div>

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
            {/* No Try Again - by design */}
          </div>

          {/* Feedback after check */}
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
    </div>
  );

  return (
    <ExamShell
      title={`Micro-skill Practice: ${skillId}`}
      layout="split"
      showTimer={false}
      totalQuestions={s.queue.length}
      currentIndex={s.pos}          // index within the current cycle queue
      statuses={statuses}           // statuses within current cycle queue
      leftPane={leftPane}
      rightPane={rightPane}
      mainPane={<div />}
      onJump={(i) => setS((prev) => ({ ...prev, pos: i, checked: !!prev.answers[prev.queue[i]]?.userAnswer && prev.checked }))}
      onBack={goBack}
      onNext={goNext}
      interceptLastNext={false}     // IMPORTANT: do not open submit modal
      userLabel="Varun Dhullipalla"
    />
  );
}
