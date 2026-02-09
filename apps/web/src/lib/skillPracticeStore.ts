export type SkillProgress = {
  skillId: string;
  index: number; // 0-based current question
  answered: Record<string, { userAnswer: string; correct: boolean }>; // questionId -> result
};

const KEY = "spv.skillPractice.v1";

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function loadAll(): Record<string, SkillProgress> {
  if (typeof window === "undefined") return {};
  return safeParse<Record<string, SkillProgress>>(localStorage.getItem(KEY), {});
}

function saveAll(map: Record<string, SkillProgress>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function loadSkillProgress(skillId: string): SkillProgress {
  const map = loadAll();
  return (
    map[skillId] ?? {
      skillId,
      index: 0,
      answered: {},
    }
  );
}

export function saveSkillProgress(progress: SkillProgress) {
  const map = loadAll();
  map[progress.skillId] = progress;
  saveAll(map);
}

export function resetSkillProgress(skillId: string) {
  const map = loadAll();
  delete map[skillId];
  saveAll(map);
}
