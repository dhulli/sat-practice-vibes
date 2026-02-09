"use client";

import { useEffect, useState } from "react";
import { getAttemptMeta } from "@/lib/attemptStore";
import { MockSubmitSection } from "./MockSubmitSection";

export function AttemptMetaActions({ attemptId }: { attemptId: string }) {
  const [sectionId, setSectionId] = useState<string | null>(null);

  useEffect(() => {
    const meta = getAttemptMeta(attemptId);
    setSectionId(meta?.sectionId ?? null);
  }, [attemptId]);

  if (!sectionId) return null;

  return <MockSubmitSection attemptId={attemptId} sectionId={sectionId} />;
}
