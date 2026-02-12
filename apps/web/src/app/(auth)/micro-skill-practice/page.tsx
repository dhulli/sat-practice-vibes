"use client";
import Link from "next/link";
import { buildMockMicroSkills } from "@/lib/microSkills";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getMicroSkillMasteryPct, clearMicroSkillSession } from "@/lib/microSkillMasteryStore";
import { useEffect, useState } from "react";

export default function MicroSkillPracticePage() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
  const refresh = () => setTick((t) => t + 1);
  window.addEventListener("focus", refresh);
  window.addEventListener("pageshow", refresh);
  return () => {
    window.removeEventListener("focus", refresh);
    window.removeEventListener("pageshow", refresh);
  };
  }, []);
  const skills = buildMockMicroSkills();

  const rw = skills.filter((s) => s.section === "RW");
  const math = skills.filter((s) => s.section === "MATH");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Micro-skill Practice</h1>
        <p className="text-sm text-muted-foreground">
          Untimed practice • check answers instantly • explanation + complexity reason
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Reading & Writing</CardTitle>
              <Badge variant="secondary">{rw.length} skills</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {rw.map((s) => {
                const pct = getMicroSkillMasteryPct(s.id, 30);

                const ctaLabel = pct === 0 ? "Start" : pct >= 100 ? "Restart" : "Resume";

                return (
                    <Card key={s.id} className="rounded-xl">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-sm font-semibold tabular-nums">Mastery - {pct}%</div>                            
                            <div className="text-sm font-medium truncate">{s.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{s.category}</div>
                        </div>                        
                        </div>

                        <Progress value={pct} />

                        {pct >= 100 ? (
                        <Button
                            size="sm"
                            className="w-full"
                            onClick={() => {
                            // clear saved mastery/session then start fresh
                            clearMicroSkillSession(s.id);
                            window.location.href = `/exam/micro-skill/${s.id}`;
                            }}
                        >
                            {ctaLabel}
                        </Button>
                        ) : (
                        <Button asChild size="sm" className="w-full">
                            <Link href={`/exam/micro-skill/${s.id}`}>{ctaLabel}</Link>
                        </Button>
                        )}
                    </CardContent>
                    </Card>
                );
            })}

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
              <Card key={s.id} className="rounded-xl">
                <CardContent className="p-4 space-y-2">
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.category}</div>
                  <Button asChild size="sm" className="w-full">
                    <Link href={`/exam/micro-skill/${s.id}`}>Start</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
