import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SkillAttemptPage({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  const { skillId } = await params;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Micro-skill Practice</h1>
        <Button asChild variant="secondary">
          <Link href="/micro-skill-practice">Back to Skills</Link>
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Skill ID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="font-mono">{skillId}</div>
          <div>Next step: render the “question → answer → check → next” flow.</div>
        </CardContent>
      </Card>
    </div>
  );
}
