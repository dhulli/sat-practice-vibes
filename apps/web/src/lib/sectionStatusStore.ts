import type { SectionStatus, SectionType } from "./sections";

type StoredStatus = Record<string, SectionStatus>; // key: sectionId e.g., RW-01

const KEY = "spv.sectionStatus.v1";

function safeParse(json: string | null): StoredStatus {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object") return parsed as StoredStatus;
    return {};
  } catch {
    return {};
  }
}

export function getSectionStatus(sectionId: string): SectionStatus {
  if (typeof window === "undefined") return "not_started";
  const map = safeParse(window.localStorage.getItem(KEY));
  return map[sectionId] ?? "not_started";
}

export function setSectionStatus(sectionId: string, status: SectionStatus): void {
  if (typeof window === "undefined") return;
  const map = safeParse(window.localStorage.getItem(KEY));
  map[sectionId] = status;
  window.localStorage.setItem(KEY, JSON.stringify(map));
}

// Optional helper to reset statuses during dev
export function resetAllSectionStatuses(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function sectionTypeFromId(sectionId: string): SectionType {
  return sectionId.startsWith("RW-") ? "RW" : "MATH";
}
