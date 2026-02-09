import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildMockSummary } from "@/lib/mockResults";
import { getAttemptMeta } from "@/lib/attemptStore";

function formatSectionType(t: string) {
  return t === "RW" ? "Reading & Writing" : "Math";
}

export default async function SectionSummaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ sectionId?: string }>;
}) {
  const { attemptId } = await params;
  const { sectionId } = await searchParams;

  // We need section type; attempt meta is in localStorage, which is client-only.
  // For now, infer from attemptId prefix is not possible; so we show a safe default RW.
  // Next step we will store sectionType in the URL or pass via client bridge.
  const sectionType = sectionId?.startsWith("MATH-") ? "MATH" : "RW";

  const summary = buildMockSummary(attemptId, sectionType);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Section Summary</h1>
          <p className="text-sm text-muted-foreground">
            {formatSectionType(summary.sectionType)}
            {sectionId ? ` • ${sectionId}` : ""} • Attempt{" "}
            <span className="font-mono">{attemptId}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href={`/attempts/section/${attemptId}`}>Back</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/section-practice">Sections</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl md:col-span-1">
          <CardHeader>
            <CardTitle>Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-4xl font-semibold">{summary.accuracyPct}%</div>
            <div className="text-sm text-muted-foreground">
              {summary.correct} / {summary.totalQuestions} correct
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">Incorrect: {summary.incorrect}</Badge>
              <Badge variant="outline">Skipped: {summary.skipped}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl md:col-span-2">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.categoryBreakdown.map((row) => (
              <div
                key={row.category}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-medium">{row.category}</div>
                  <div className="text-sm text-muted-foreground">
                    {row.correct}/{row.total} correct
                  </div>
                </div>
                <div className="text-lg font-semibold">{row.accuracyPct}%</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button asChild>
          <Link href={`/attempts/section/${attemptId}/review`}>Review</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/section-practice">Practice another section</Link>
        </Button>
      </div>
    </div>
  );
}
