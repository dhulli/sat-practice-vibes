"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { SectionAttemptClient } from "@/components/attempts/SectionAttemptClient";
import { getAttemptMeta } from "@/lib/attemptStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SectionAttemptPage() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = params.attemptId;

  const meta = useMemo(() => getAttemptMeta(attemptId), [attemptId]);

  if (!meta) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Section Attempt</h1>
          <Button asChild variant="secondary">
            <Link href="/section-practice">Back to Sections</Link>
          </Button>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Attempt not found</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            We couldn&apos;t find this attempt in local storage. Start a new section from Section Practice.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <SectionAttemptClient
        attemptId={attemptId}
        sectionId={meta.sectionId}
        sectionType={meta.sectionType}
      />
    </div>
  );
}
