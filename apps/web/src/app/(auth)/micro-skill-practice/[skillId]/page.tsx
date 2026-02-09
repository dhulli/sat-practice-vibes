import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SkillPractice } from "@/components/micro/SkillPractice";

export default async function SkillAttemptPage({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  const { skillId } = await params;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="secondary">
          <Link href="/micro-skill-practice">Back to Skills</Link>
        </Button>
      </div>

      <SkillPractice key={skillId} skillId={skillId} />
    </div>
  );
}
