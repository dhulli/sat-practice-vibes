"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SectionDef } from "@/lib/sections";
import { getSectionStatus, setSectionStatus } from "@/lib/sectionStatusStore";
import {
  createSectionAttempt,
  getActiveAttemptIdForSection,
  getLastCompletedAttemptIdForSection,
} from "@/lib/attemptStore";
import { useRouter } from "next/navigation";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function statusLabel(status: string) {
  switch (status) {
    case "in_progress":
      return { text: "In progress", variant: "secondary" as const };
    default:
      return { text: "Ready", variant: "outline" as const };
  }
}

export function SectionCard({ section }: { section: SectionDef }) {
  const [_, force] = useState(0);

  const status = useMemo(() => {
    const s = getSectionStatus(section.id);
    return s === "in_progress" ? "in_progress" : "not_started";
  }, [section.id, _]);
  const activeAttemptId = useMemo(() => getActiveAttemptIdForSection(section.id), [section.id, _]);
  const lastCompletedAttemptId = useMemo(
    () => getLastCompletedAttemptIdForSection(section.id),
    [section.id, _]
  );

  const badge = statusLabel(status);
  const router = useRouter();

  function refresh() {
    force((x) => x + 1);
  }

  async function onStart() {
    try {
      const attemptId = await createSectionAttempt(section.id, section.type);
      setSectionStatus(section.id, "in_progress");
      refresh();
      router.push(`/attempts/section/${attemptId}`);
    } catch {
      alert("Could not start attempt on server. Please check auth and database setup.");
    }
  }

  function onResume() {
    if (!activeAttemptId) return;
    router.push(`/attempts/section/${activeAttemptId}`);
  }

  const canReview = !!lastCompletedAttemptId;

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{section.title}</CardTitle>
          <Badge variant={badge.variant}>{badge.text}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <div>{section.totalQuestions} questions</div>
          <div>Time: {formatTime(section.timeLimitSeconds)}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          {status === "in_progress" ? (
            <>
              <Button onClick={onResume}>Resume</Button>
              <Button variant="secondary" onClick={onStart}>
                Start New Attempt
              </Button>
            </>
          ) : (
            <Button onClick={onStart}>Start Attempt</Button>
          )}

          {canReview ? (
            <Button asChild variant="secondary">
              <Link href={`/attempts/section/${lastCompletedAttemptId}/summary?sectionId=${section.id}`}>
                Review Last Attempt
              </Link>
            </Button>
          ) : (
            <Button variant="secondary" disabled>
              Review Last Attempt
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
