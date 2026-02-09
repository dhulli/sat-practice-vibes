export type SkillSection = "RW" | "MATH";

export type MicroSkill = {
  id: string;          // stable like "RW-MS-001"
  section: SkillSection;
  category: string;    // one of 4 categories
  name: string;        // micro-skill label
  active: boolean;     // for future enable/disable
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

function makeId(prefix: string, n: number) {
  return `${prefix}-${String(n).padStart(3, "0")}`;
}

export function buildMockMicroSkills(): MicroSkill[] {
  const rw: MicroSkill[] = Array.from({ length: 50 }, (_, i) => {
    const n = i + 1;
    const category = RW_CATEGORIES[i % 4];
    return {
      id: makeId("RW-MS", n),
      section: "RW",
      category,
      name: `RW Micro-skill ${String(n).padStart(2, "0")}`,
      active: true,
    };
  });

  const math: MicroSkill[] = Array.from({ length: 36 }, (_, i) => {
    const n = i + 1;
    const category = MATH_CATEGORIES[i % 4];
    return {
      id: makeId("MATH-MS", n),
      section: "MATH",
      category,
      name: `Math Micro-skill ${String(n).padStart(2, "0")}`,
      active: true,
    };
  });

  return [...rw, ...math];
}
