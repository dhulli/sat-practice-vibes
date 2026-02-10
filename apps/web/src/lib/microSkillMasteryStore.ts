export type CycleAnswer = { userAnswer: string; correct: boolean };

export type MicroSkillSessionState = {
  version: 1;
  skillId: string;
  cycle: number;
  queue: number[];
  pos: number;
  nextQueue: number[];
  answers: Record<number, CycleAnswer>;
  mastered: Record<number, boolean>;
  checked: boolean;
  updatedAt: number;
};

function key(skillId: string) {
  return `spv.micro.mastery.v1.${skillId}`;
}

export function loadMicroSkillSession(skillId: string): MicroSkillSessionState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key(skillId));
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as MicroSkillSessionState;
    if (obj?.version !== 1 || obj.skillId !== skillId) return null;
    return obj;
  } catch {
    return null;
  }
}

export function saveMicroSkillSession(state: MicroSkillSessionState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(state.skillId), JSON.stringify(state));
}

export function clearMicroSkillSession(skillId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key(skillId));
}

export function getMicroSkillMasteryPct(skillId: string, total = 30): number {
  const s = loadMicroSkillSession(skillId);
  if (!s) return 0;
  const masteredCount = Object.values(s.mastered || {}).filter(Boolean).length;
  return Math.round((masteredCount / total) * 100);
}
