import type { SectionType } from "./sections";

export type CategoryBreakdownRow = {
  category: string;
  total: number;
  correct: number;
  accuracyPct: number;
};

export type AttemptSummary = {
  attemptId: string;
  sectionType: SectionType;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracyPct: number;
  categoryBreakdown: CategoryBreakdownRow[];
};

const RW_CATEGORIES = [
  "Information & Ideas",
  "Craft & Structure",
  "Expression of Ideas",
  "Standard English Conventions",
] as const;

const MATH_CATEGORIES = [
  "Algebra",
  "Advanced Math",
  "Problem-Solving & Data Analysis",
  "Geometry & Trigonometry",
] as const;

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function pct(correct: number, total: number) {
  if (total <= 0) return 0;
  return round1((correct / total) * 100);
}

// Deterministic pseudo-random based on attemptId (so refresh shows same values)
function seeded(attemptId: string) {
  let h = 0;
  for (let i = 0; i < attemptId.length; i++) h = (h * 31 + attemptId.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 2 ** 32;
  };
}

export function buildMockSummary(attemptId: string, sectionType: SectionType): AttemptSummary {
  const rand = seeded(attemptId);

  const totalQuestions = sectionType === "RW" ? 27 : 22;
  const categories = sectionType === "RW" ? [...RW_CATEGORIES] : [...MATH_CATEGORIES];

  // Split total questions across 4 categories (roughly even, deterministic)
  const base = Math.floor(totalQuestions / 4);
  const remainder = totalQuestions % 4;
  const totals = categories.map((_, i) => base + (i < remainder ? 1 : 0));

  // Create plausible correct counts
  const breakdown: CategoryBreakdownRow[] = totals.map((t, i) => {
    const r = rand();
    const correct = Math.max(0, Math.min(t, Math.round(t * (0.45 + r * 0.45)))); // 45%..90%
    return {
      category: categories[i],
      total: t,
      correct,
      accuracyPct: pct(correct, t),
    };
  });

  const correct = breakdown.reduce((sum, row) => sum + row.correct, 0);

  // Make skipped small and deterministic
  const skipped = Math.min(3, Math.floor(rand() * 3)); // 0..2 (sometimes 3)
  const incorrect = Math.max(0, totalQuestions - correct - skipped);

  return {
    attemptId,
    sectionType,
    totalQuestions,
    correct,
    incorrect,
    skipped,
    accuracyPct: pct(correct, totalQuestions),
    categoryBreakdown: breakdown,
  };
}
