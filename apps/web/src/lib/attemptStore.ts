import type { SectionType } from "./sections";

export type AttemptKind = "section";

export type SectionAttemptMeta = {
  attemptId: string;
  kind: "section";
  sectionId: string; // e.g. RW-01
  sectionType: SectionType;
  startedAt: string; // ISO
  status: "in_progress" | "submitted" | "exited";
};

type AttemptMap = Record<string, SectionAttemptMeta>; // attemptId -> meta

type SectionToAttempt = Record<string, string>; // sectionId -> attemptId (last in_progress)
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
  return `att_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function writeAttemptMeta(meta: SectionAttemptMeta) {
  const attempts = safeParse<AttemptMap>(localStorage.getItem(KEY_ATTEMPTS), {});
  attempts[meta.attemptId] = meta;
  localStorage.setItem(KEY_ATTEMPTS, JSON.stringify(attempts));
}

export async function createSectionAttempt(sectionId: string, sectionType: SectionType): Promise<string> {
  if (typeof window === "undefined") return "att_server";

  let attemptId = uid();
  let startedAt = new Date().toISOString();

  try {
    const res = await fetch("/api/section-attempts/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId, sectionType }),
    });

    if (res.ok) {
      const data = (await res.json()) as { attemptId: string; startedAt: string };
      attemptId = data.attemptId;
      startedAt = data.startedAt;
    }
  } catch {
    // fallback to local-only mode
  }

  writeAttemptMeta({
    attemptId,
    kind: "section",
    sectionId,
    sectionType,
    startedAt,
    status: "in_progress",
  });

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

export async function saveAttemptProgress(args: {
  attemptId: string;
  currentIndex: number;
  remainingSeconds: number;
  selected: Record<number, string>;
  review: Record<number, boolean>;
}): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    await fetch(`/api/section-attempts/${args.attemptId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
  } catch {
    // noop
  }
}

export async function markAttemptSubmitted(attemptId: string): Promise<void> {
  if (typeof window === "undefined") return;

  const attempts = safeParse<AttemptMap>(localStorage.getItem(KEY_ATTEMPTS), {});
  const meta = attempts[attemptId];
  if (!meta) return;

  meta.status = "submitted";
  writeAttemptMeta(meta);

  const completed = safeParse<SectionToLastCompleted>(localStorage.getItem(KEY_SECTION_COMPLETED), {});
  completed[meta.sectionId] = attemptId;
  localStorage.setItem(KEY_SECTION_COMPLETED, JSON.stringify(completed));

  const active = safeParse<SectionToAttempt>(localStorage.getItem(KEY_SECTION_ACTIVE), {});
  if (active[meta.sectionId] === attemptId) {
    delete active[meta.sectionId];
    localStorage.setItem(KEY_SECTION_ACTIVE, JSON.stringify(active));
  }

  try {
    await fetch(`/api/section-attempts/${attemptId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // noop
  }
}

export async function markAttemptExited(attemptId: string): Promise<void> {
  if (typeof window === "undefined") return;

  const attempts = safeParse<AttemptMap>(localStorage.getItem(KEY_ATTEMPTS), {});
  const meta = attempts[attemptId];
  if (!meta) return;

  meta.status = "exited";
  writeAttemptMeta(meta);

  const active = safeParse<SectionToAttempt>(localStorage.getItem(KEY_SECTION_ACTIVE), {});
  if (active[meta.sectionId] === attemptId) {
    delete active[meta.sectionId];
    localStorage.setItem(KEY_SECTION_ACTIVE, JSON.stringify(active));
  }

  try {
    await fetch(`/api/section-attempts/${attemptId}/exit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // noop
  }
}

export function getAttemptMeta(attemptId: string): SectionAttemptMeta | null {
  if (typeof window === "undefined") return null;
  const attempts = safeParse<Record<string, SectionAttemptMeta>>(localStorage.getItem(KEY_ATTEMPTS), {});
  return attempts[attemptId] ?? null;
}
