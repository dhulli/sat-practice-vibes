"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { buildMockSkillQuestions } from "@/lib/mockSkillQuestions";
import { loadSkillProgress, saveSkillProgress, resetSkillProgress } from "@/lib/skillPracticeStore";
import { Progress } from "@/components/ui/progress";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


function strip(s: string) {
  return s.trim();
}

function renderHtml(html: string) {
  return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function SkillPractice({ skillId }: { skillId: string }) {
  const questions = useMemo(() => buildMockSkillQuestions(skillId, 30), [skillId]);

  const initial = useMemo(() => {
    const p = loadSkillProgress(skillId);
    const safeIndex = Math.min(p.index ?? 0, questions.length - 1);
    return { idx: safeIndex };
  }, [skillId, questions.length]);

  const [idx, setIdx] = useState<number>(initial.idx);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState<null | { correct: boolean; correctAnswer: string }>(null);

  const q = questions[idx];
  // If user already answered this question earlier, preload answer and checked state
    useEffect(() => {
        const p = loadSkillProgress(skillId);
        const prev = p.answered[q.id];
        if (prev) {
            setAnswer(prev.userAnswer);
            setChecked({ correct: prev.correct, correctAnswer: q.correctAnswer });
        } else {
            setAnswer("");
            setChecked(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skillId, q.id]);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Enter" && !checked && answer.trim()) {
            e.preventDefault();
            doCheck();
            }
            if ((e.key === "n" || e.key === "N") && checked) {
            e.preventDefault();
            next();
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [answer, checked, idx]);


  const progressState = typeof window === "undefined" ? null : loadSkillProgress(skillId);
  const answeredCount = progressState ? Object.keys(progressState.answered).length : 0;

  const correctCount = progressState
    ? Object.values(progressState.answered).filter((a) => a.correct).length
    : 0;

  const accuracyPct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const percentDone = Math.round(((idx + 1) / questions.length) * 100);

  useEffect(() => {
    const p = loadSkillProgress(skillId);
    p.index = idx;
    saveSkillProgress(p);
  }, [skillId, idx]);  

  function doCheck() {
    const user = strip(answer);
    if (!user) return;

    let correct = false;
    if (q.kind === "mcq") {
      correct = user.toUpperCase() === q.correctAnswer.toUpperCase();
    } else {
      correct = user === q.correctAnswer;
    }

    setChecked({ correct, correctAnswer: q.correctAnswer });

    const p = loadSkillProgress(skillId);
    p.answered[q.id] = { userAnswer: user, correct };
    saveSkillProgress(p);
  }

  function next() {
    if (idx >= questions.length - 1) return;
    setIdx(idx + 1);
    setAnswer("");
    setChecked(null);
  }

  const progress = `${idx + 1} / ${questions.length}`;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
            <h1 className="text-2xl font-semibold tracking-tight">Practice: {skillId}</h1>
            <p className="text-sm text-muted-foreground">Untimed • Instant check • Explanation</p>
        </div>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More">
                <MoreVertical className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                onClick={() => {
                    resetSkillProgress(skillId);
                    setIdx(0);
                    setAnswer("");
                    setChecked(null);
                }}
                >
                Reset practice
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
                Answered: <span className="font-medium text-foreground">{answeredCount}</span> / {questions.length}
                {"  "}•{"  "}
                Accuracy: <span className="font-medium text-foreground">{accuracyPct}%</span>
            </div>

            <div className="flex items-center gap-2">
                <Badge variant="secondary">Q {idx + 1} / {questions.length}</Badge>
                <Badge variant="outline">{q.complexity}</Badge>
            </div>
            </div>

            <Progress value={percentDone} />
        </CardContent>
      </Card>


      <Card className="rounded-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">Question</CardTitle>
          {q.passageHtml ? renderHtml(q.passageHtml) : null}
          {renderHtml(q.questionHtml)}
          {q.choices ? (
            <div className="grid gap-2 sm:grid-cols-2 pt-2">
              {q.choices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="rounded-xl border p-3 text-left hover:bg-muted/50 transition"
                  onClick={() => setAnswer(c.id)}
                >
                  <div className="text-xs text-muted-foreground">{c.id}</div>
                  <div className="text-sm">{renderHtml(c.textHtml)}</div>
                </button>
              ))}
            </div>
          ) : null}
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">Your answer</div>
            <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={q.kind === "mcq" ? "Type A, B, C, or D" : "Type your answer"}
                disabled={!!checked}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={doCheck} disabled={!answer.trim() || !!checked}>
                Check
            </Button>
            <Button variant="secondary" onClick={next} disabled={!checked || idx >= questions.length - 1}>
              Next
            </Button>
            <Button
                variant="secondary"
                onClick={() => setChecked(null)}
                disabled={!checked}
                >
                Try again
            </Button>
          </div>

          {checked ? (
            <div className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  {checked.correct ? "✅ Correct" : "❌ Incorrect"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Correct answer: <span className="font-mono">{checked.correctAnswer}</span>
                </div>
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
}
