import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SectionReviewPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Section Review</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href={`/attempts/section/${attemptId}/summary`}>
              Back to Summary
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/section-practice">Back to Sections</Link>
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Mock Review</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Attempt: <span className="font-mono">{attemptId}</span>
          <div className="mt-2">
            Review UI will be implemented after section attempt UI is ready.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
