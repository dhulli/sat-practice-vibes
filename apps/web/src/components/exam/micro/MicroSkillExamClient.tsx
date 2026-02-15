"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { MicroSkillShell } from "@/components/exam/MicroSkillShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function strip(s: string) {
  return (s ?? "").trim();
}

function renderHtml(html?: string | null) {
  if (!html) return null;
  return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}

type SkillMeta = {
  id: string;
  code?: string | null;
  name?: string | null;
  section?: string | null;
  category?: string | null;
};

type SessionDTO = {
  id: string;
  status: "IN_PROGRESS" | "MASTERED";
  cycle: number;
  pos: number;
  queueLen: number;
  nextQueueLen: number;
  masteredCount: number;
  totalQuestions: number;
  masteryPct: number;
  cycleAccuracyPct: number;
};

type Choice = { id: string; textHtml: string };

type QuestionDTO = {
  id: string;
  type: "RW_PASSAGE_MCQ" | "MATH_MCQ" | "MATH_SPR" | "GRAPH_MCQ" | string;
  passageHtml?: string | null;
  questionHtml: string;
  choices?: Choice[] | null;
  complexity: string;
  complexityReasonHtml: string;
  explanationHtml: string;
  assetUrl?: string | null;
};

type QuestionResponse = {
  done: boolean;
  skill?: SkillMeta;
  session?: SessionDTO;
  question?: QuestionDTO;
  masteryPct?: number;
};

type AnswerResponse = {
  correct: boolean;
  correctAnswer: string;
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = (await res.json()) as unknown;
  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? `Request failed: ${res.status}`
    );
  }
  return data as T;
}

export function MicroSkillExamClient({ microSkillId }: { microSkillId: string }) {
  const router = useRouter();

  const [skill, setSkill] = useState<SkillMeta | null>(null);
  const [skillName, setSkillName] = useState<string | null>(null);
  const [session, setSession] = useState<SessionDTO | null>(null);
  const [question, setQuestion] = useState<QuestionDTO | null>(null);
  const [done, setDone] = useState(false);
  const [displayPos, setDisplayPos] = useState<number>(0);

  // Exit dialog
  const [exitOpen, setExitOpen] = useState(false);

  // Answer UI state
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [checkResult, setCheckResult] = useState<AnswerResponse | null>(null);

  const title = useMemo(() => {
    const left = skill?.code ?? microSkillId;
    const right = skill?.name ? ` • ${skill.name}` : "";
    return `Micro-skill Practice: ${left}${right}`;
  }, [skill?.code, skill?.name, microSkillId]);

  const isSPR = String(question?.type ?? "") === "MATH_SPR";
  const isMCQ =
    !isSPR && Array.isArray(question?.choices) && (question?.choices?.length ?? 0) > 0;

  // ---------- Load / start session ----------
  async function ensureSession() {
    // Start or reuse server session (idempotent)
    await api<{ session: SessionDTO }>(`/api/micro-skills/${microSkillId}/session`, {
      method: "POST",
    });
  }

  async function refreshQuestion() {
    const data = await api<QuestionResponse>(`/api/micro-skills/${microSkillId}/question`);
    setSkillName(data.skill?.name ?? null);
    setDone(!!data.done);

    if (data.skill) setSkill(data.skill);

    if (data.session) {
      setSession(data.session);
      setDisplayPos(data.session.pos + 1);
    }
    if (data.question) {
      setQuestion(data.question);
      // Reset answer UI whenever server advances to a new question
      setAnswer("");
      setChecked(false);
      setCheckResult(null);
    }
  }

  async function refreshScreen() {
    const data = await api<QuestionResponse>(`/api/micro-skills/${microSkillId}/question`);

    if (data.session) {
      setSession(data.session);
      // IMPORTANT: do NOT +1 here (keeps Q 6/30 after Check)
      setDisplayPos(data.session.pos);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await ensureSession();
        if (!mounted) return;
        await refreshQuestion();
      } catch (e: unknown) {
        // If unauthorized, bounce to login
        if (String((e as Error)?.message ?? "").toLowerCase().includes("unauthorized")) {
          router.push("/login");
          return;
        }
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microSkillId]);

  // ---------- Actions ----------
  async function doCheck() {
    if (!question) return;

    const user = strip(answer);
    if (!user) return;

    setChecked(true);

    try {
      const r = await api<AnswerResponse>(`/api/micro-skills/${microSkillId}/answer`, {
        method: "POST",
        body: JSON.stringify({
          questionId: question.id,
          answer: user, // ✅ MUST be "answer"
        }),
      });

      setCheckResult(r);

      // refresh mastery HUD only (no question advance)
      await refreshScreen();
    } catch (e) {
      setChecked(false);
      throw e;
    }
  }

  async function goNext() {
    // Must check before Next
    if (!checked) return;

    // Ask server for next question (server advances pos/cycle)
    await refreshQuestion();
  }

  function exit() {
    setExitOpen(true);
  }

  // ---------- Done screen ----------
  if (done) {
    return (
      <>
        <MicroSkillShell
          title={title}
          userLabel="Rama Krishna Dhullipalla"
          leftPane={
            <div className="h-full overflow-auto p-6 text-sm text-muted-foreground">
              Complete
            </div>
          }
          rightPane={
            <div className="h-full overflow-auto p-6">
              <Card className="rounded-2xl">
                <CardContent className="p-6 space-y-3">
                  <div className="text-2xl font-semibold">🎉 Micro-skill mastered</div>
                  <div className="text-sm text-muted-foreground">
                    {skill?.name ? (
                      <>
                        Skill:{" "}
                        <span className="font-medium text-foreground">{skill.name}</span>
                        {skill.code ? (
                          <span className="text-muted-foreground"> ({skill.code})</span>
                        ) : null}
                      </>
                    ) : (
                      <>
                        Skill:{" "}
                        <span className="font-medium text-foreground">{microSkillId}</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      onClick={async () => {
                        // Start fresh cycle on server by clearing session (if you have endpoint),
                        // else just re-POST session and refresh
                        await api(`/api/micro-skills/${microSkillId}/reset`, {
                          method: "POST",
                        }).catch(() => {});
                        await ensureSession();
                        await refreshQuestion();
                      }}
                    >
                      Restart
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => router.push("/micro-skill-practice")}
                    >
                      Back to skills
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          }
          onExit={exit}
        />

        <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Exit practice?</AlertDialogTitle>
              <AlertDialogDescription>
                Your progress is saved. You can resume later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push("/micro-skill-practice")}>
                Exit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  if (!session || !question) {
    return (
      <>
        <MicroSkillShell
          title="Micro-skill Practice"
          userLabel="Rama Krishna Dhullipalla"
          leftPane={
            <div className="h-full overflow-auto p-6 text-sm text-muted-foreground">
              Loading…
            </div>
          }
          rightPane={
            <div className="h-full overflow-auto p-6 text-sm text-muted-foreground">
              Loading…
            </div>
          }
          onExit={exit}
        />

        <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Exit practice?</AlertDialogTitle>
              <AlertDialogDescription>
                Your progress is saved. You can resume later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push("/micro-skill-practice")}>
                Exit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // ---------- UI panes ----------
  const leftPane = (
    <div className="h-full overflow-auto p-6">
      {question.type === "GRAPH_MCQ" && question.assetUrl ? (
        <div className="space-y-4">
          <img
            src={question.assetUrl}
            alt="Graph"
            className="max-w-full rounded-xl border"
          />
          {renderHtml(question.passageHtml)}
        </div>
      ) : (
        renderHtml(question.passageHtml) ?? (
          <div className="text-sm text-muted-foreground">No stimulus</div>
        )
      )}
    </div>
  );

  const rightPane = (
    <div className="h-full overflow-auto p-6 space-y-4">
      {/* Mastery HUD */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground">Mastery</div>
            <div className="text-2xl font-semibold tabular-nums">{session.masteryPct}%</div>
          </div>

          <div className="text-sm text-muted-foreground">
            Mastered:{" "}
            <span className="font-medium text-foreground">
              {session.masteredCount}/{session.totalQuestions}
            </span>
            {"  "}•{"  "}
            Remaining:{" "}
            <span className="font-medium text-foreground">
              {Math.max(session.totalQuestions - session.masteredCount, 0)}
            </span>
          </div>

          <div className="text-sm text-muted-foreground">
            Cycle <span className="font-medium text-foreground">{session.cycle}</span>
            {"  "}•{"  "}
            Q{" "}
            <span className="font-medium text-foreground">
              {displayPos}/{session.queueLen}
            </span>
            {session.nextQueueLen > 0 ? (
              <>
                {"  "}•{"  "}
                Missed this cycle:{" "}
                <span className="font-medium text-foreground">{session.nextQueueLen}</span>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="rounded-2xl">
        <CardContent className="p-5 space-y-3">
          {renderHtml(question.questionHtml)}

          {/* Answer UI */}
          {isMCQ ? (
            <div className="space-y-2">
              {question.choices!.map((c) => {
                const isSel = answer === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={[
                      "w-full rounded-xl border p-4 text-left transition",
                      isSel ? "bg-muted border-muted-foreground/30" : "hover:bg-muted/50",
                      checked ? "opacity-70 cursor-not-allowed" : "",
                    ].join(" ")}
                    onClick={() => !checked && setAnswer(c.id)}
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
              <div className="text-sm font-medium">Your answer</div>
              <Input
                value={answer}
                onChange={(e) => !checked && setAnswer(e.target.value)}
                placeholder="Enter your answer"
                disabled={checked}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={doCheck} disabled={!strip(answer) || checked}>
              Check
            </Button>
            <Button variant="secondary" onClick={goNext} disabled={!checked}>
              Next
            </Button>
          </div>

          {/* Feedback */}
          {checked && checkResult ? (
            <div className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="font-semibold">
                  {checkResult.correct ? "✅ Correct" : "❌ Incorrect"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Correct answer:{" "}
                  <span className="font-mono">{checkResult.correctAnswer}</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Complexity</div>
                <div className="text-sm text-muted-foreground">{question.complexity}</div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Complexity reason</div>
                {renderHtml(question.complexityReasonHtml)}
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Explanation</div>
                {renderHtml(question.explanationHtml)}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <MicroSkillShell
        title={title}
        userLabel="Rama Krishna Dhullipalla"
        leftPane={leftPane}
        rightPane={rightPane}
        onExit={exit}
      />

      <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit practice?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress is saved. You can resume later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/micro-skill-practice")}>
              Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
