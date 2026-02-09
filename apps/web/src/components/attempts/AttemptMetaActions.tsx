"use client";

import { getAttemptMeta } from "@/lib/attemptStore";
import { MockSubmitSection } from "./MockSubmitSection";

export function AttemptMetaActions({ attemptId }: { attemptId: string }) {
  const meta = getAttemptMeta(attemptId);
  const sectionId = meta?.sectionId ?? null;

  if (!sectionId) return null;

  return <MockSubmitSection attemptId={attemptId} sectionId={sectionId} />;
}
