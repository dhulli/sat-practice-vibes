"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAttemptMeta } from "@/lib/attemptStore";

export function GoToSummaryButton({ attemptId }: { attemptId: string }) {
  const meta = getAttemptMeta(attemptId);
  const sectionId = meta?.sectionId;

  const href = sectionId
    ? `/attempts/section/${attemptId}/summary?sectionId=${encodeURIComponent(sectionId)}`
    : `/attempts/section/${attemptId}/summary`;

  return (
    <Button asChild>
      <Link href={href}>Go to Summary (mock)</Link>
    </Button>
  );
}
