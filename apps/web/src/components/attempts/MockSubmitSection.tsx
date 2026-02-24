"use client";

import { Button } from "@/components/ui/button";
import { markAttemptSubmitted } from "@/lib/attemptStore";
import { setSectionStatus } from "@/lib/sectionStatusStore";

export function MockSubmitSection({
  attemptId,
  sectionId,
}: {
  attemptId: string;
  sectionId: string;
}) {
  return (
    <Button
      onClick={async () => {
        await markAttemptSubmitted(attemptId);
        setSectionStatus(sectionId, "not_started");
        window.location.href = `/attempts/section/${attemptId}/summary?sectionId=${encodeURIComponent(sectionId)}`;
      }}
    >
      Mock Submit (complete attempt)
    </Button>
  );
}
