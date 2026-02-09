import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AttemptMetaActions } from "@/components/attempts/AttemptMetaActions";


export default async function SectionAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

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
          <CardTitle>Attempt ID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="font-mono text-sm">{attemptId}</div>
          <p className="text-sm text-muted-foreground">
            This is a placeholder for the timed section-taking UI. Next chunk will
            render questions and timer.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/attempts/section/${attemptId}/summary`}>
                Go to Summary (mock)
              </Link>
            </Button>
          </div>
          <div className="flex gap-2">
            <AttemptMetaActions attemptId={attemptId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
