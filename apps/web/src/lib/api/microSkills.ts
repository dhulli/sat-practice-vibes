export type SkillSessionInfo = {
  id: string;
  status: "IN_PROGRESS" | "MASTERED";
  cycle: number;
  pos?: number;
  queueLen?: number;
  nextQueueLen?: number;
  masteredCount?: number;
  totalQuestions?: number;
  masteryPct?: number;
  cycleAccuracyPct?: number;
};

export type MicroSkillQuestionPayload = {
  id: string;
  type: string;
  passageHtml?: string | null;
  questionHtml: string;
  choices?: unknown;
  complexity?: string;
  complexityReasonHtml?: string;
  explanationHtml?: string;
  assetUrl?: string | null;
};

export async function startSkillSession(microSkillId: string) {
  const r = await fetch(`/api/micro-skills/${microSkillId}/session`, { method: "POST" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getCurrentSkillQuestion(microSkillId: string) {
  const r = await fetch(`/api/micro-skills/${microSkillId}/question`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function submitSkillAnswer(microSkillId: string, questionId: string, answer: string) {
  const r = await fetch(`/api/micro-skills/${microSkillId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, answer }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function exitSkill(microSkillId: string) {
  const r = await fetch(`/api/micro-skills/${microSkillId}/exit`, { method: "POST" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
