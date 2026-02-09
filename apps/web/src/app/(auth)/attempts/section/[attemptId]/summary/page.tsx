import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SectionSummaryPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Section Summary</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href={`/attempts/section/${attemptId}`}>Back to Attempt</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/section-practice">Back to Sections</Link>
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Mock Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            Attempt: <span className="font-mono">{attemptId}</span>
          </div>
          <div>
            Score and category breakdown will be rendered here once we plug in
            mocked attempt results.
          </div>

          <Button asChild>
            <Link href={`/attempts/section/${attemptId}/review`}>
              Review (placeholder)
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
