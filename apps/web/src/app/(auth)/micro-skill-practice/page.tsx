"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type SkillRow = {
  id: string;
  code: string;
  name: string;
  section: "RW" | "MATH";
  category: string;
  masteryPct: number;
  masteredCount: number;
  totalQuestions: number;
};

export default function MicroSkillPracticePage() {
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/micro-skills", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setSkills(j.skills ?? []))
      .finally(() => setLoading(false));
  }, []);

  const { rw, math } = useMemo(() => {
    const rw = skills.filter((s) => s.section === "RW");
    const math = skills.filter((s) => s.section === "MATH");
    return { rw, math };
  }, [skills]);

  function SkillCard({ s }: { s: SkillRow }) {
    const pct = Math.max(0, Math.min(100, s.masteryPct));
    const ctaLabel = pct === 0 ? "Start" : pct >= 100 ? "Restart" : "Resume";

    return (
      <Card className="rounded-xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{s.name}</div>
              <div className="text-xs text-muted-foreground truncate">{s.category}</div>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold tabular-nums">{pct}%</div>
              <div className="text-[10px] text-muted-foreground">Mastery</div>
            </div>
          </div>

          <Progress value={pct} />

          <Button asChild size="sm" className="w-full">
            <Link href={`/exam/micro-skill/${s.id}`}>{ctaLabel}</Link>
          </Button>
          <Button
            size="sm"
            className="w-full"
            onClick={async () => {
              await fetch(`/api/micro-skills/${s.id}/restart`, { method: "POST" });
              window.location.href = `/exam/micro-skill/${s.id}`;
            }}
          >
            Restart
          </Button>

        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Micro-skill Practice</h1>
        <p className="text-sm text-muted-foreground">
          Untimed practice • full-cycle repeats until 100% mastery • instant check + explanation
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading skills…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Reading & Writing</CardTitle>
                <Badge variant="secondary">{rw.length} skills</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {rw.map((s) => (
                <SkillCard key={s.id} s={s} />
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Math</CardTitle>
                <Badge variant="secondary">{math.length} skills</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {math.map((s) => (
                <SkillCard key={s.id} s={s} />
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
