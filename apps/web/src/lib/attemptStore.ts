import type { SectionType } from "./sections";

export type AttemptKind = "section";

export type SectionAttemptMeta = {
  attemptId: string;
  kind: "section";
  sectionId: string;      // e.g. RW-01
  sectionType: SectionType;
  startedAt: string;      // ISO
  status: "in_progress" | "submitted";
};

type AttemptMap = Record<string, SectionAttemptMeta>; // attemptId -> meta
type SectionToAttempt = Record<string, string>;       // sectionId -> attemptId (last in_progress)
type SectionToLastCompleted = Record<string, string>; // sectionId -> attemptId (last submitted)

const KEY_ATTEMPTS = "spv.attempts.v1";
const KEY_SECTION_ACTIVE = "spv.section.activeAttempt.v1";
const KEY_SECTION_COMPLETED = "spv.section.lastCompletedAttempt.v1";

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function uid(): string {
  // Good enough for mock attempts; backend will replace with UUIDv7 later
  return `att_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createSectionAttempt(sectionId: string, sectionType: SectionType): string {
  if (typeof window === "undefined") return "att_server";

  const attemptId = uid();
  const attempts = safeParse<AttemptMap>(localStorage.getItem(KEY_ATTEMPTS), {});
  attempts[attemptId] = {
    attemptId,
    kind: "section",
    sectionId,
    sectionType,
    startedAt: new Date().toISOString(),
    status: "in_progress",
  };
  localStorage.setItem(KEY_ATTEMPTS, JSON.stringify(attempts));

  const active = safeParse<SectionToAttempt>(localStorage.getItem(KEY_SECTION_ACTIVE), {});
  active[sectionId] = attemptId;
  localStorage.setItem(KEY_SECTION_ACTIVE, JSON.stringify(active));

  return attemptId;
}

export function getActiveAttemptIdForSection(sectionId: string): string | null {
  if (typeof window === "undefined") return null;
  const active = safeParse<SectionToAttempt>(localStorage.getItem(KEY_SECTION_ACTIVE), {});
  return active[sectionId] ?? null;
}

export function getLastCompletedAttemptIdForSection(sectionId: string): string | null {
  if (typeof window === "undefined") return null;
  const completed = safeParse<SectionToLastCompleted>(localStorage.getItem(KEY_SECTION_COMPLETED), {});
  return completed[sectionId] ?? null;
}

export function markAttemptSubmitted(attemptId: string): void {
  if (typeof window === "undefined") return;

  const attempts = safeParse<AttemptMap>(localStorage.getItem(KEY_ATTEMPTS), {});
  const meta = attempts[attemptId];
  if (!meta) return;

  meta.status = "submitted";
  attempts[attemptId] = meta;
  localStorage.setItem(KEY_ATTEMPTS, JSON.stringify(attempts));

  // update last completed
  const completed = safeParse<SectionToLastCompleted>(localStorage.getItem(KEY_SECTION_COMPLETED), {});
  completed[meta.sectionId] = attemptId;
  localStorage.setItem(KEY_SECTION_COMPLETED, JSON.stringify(completed));

  // clear active for this section
  const active = safeParse<SectionToAttempt>(localStorage.getItem(KEY_SECTION_ACTIVE), {});
  if (active[meta.sectionId] === attemptId) {
    delete active[meta.sectionId];
    localStorage.setItem(KEY_SECTION_ACTIVE, JSON.stringify(active));
  }
}

export function getAttemptMeta(attemptId: string): SectionAttemptMeta | null {
    if (typeof window === "undefined") return null;
    const attempts = safeParse<Record<string, SectionAttemptMeta>>(localStorage.getItem(KEY_ATTEMPTS), {});
    return attempts[attemptId] ?? null;
}
