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
      onClick={() => {
        markAttemptSubmitted(attemptId);
        setSectionStatus(sectionId, "completed");
        window.location.href = `/attempts/section/${attemptId}/summary`;
      }}
    >
      Mock Submit (complete)
    </Button>
  );
}
