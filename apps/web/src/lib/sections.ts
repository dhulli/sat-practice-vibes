export type SectionType = "RW" | "MATH";
export type SectionStatus = "not_started" | "in_progress" | "completed";

export type SectionDef = {
  id: string;              // stable identifier like "RW-01"
  type: SectionType;
  number: number;          // 1..30
  title: string;           // "RW Section 01"
  totalQuestions: number;  // RW=27, Math=22
  timeLimitSeconds: number; // choose defaults now; can adjust later
};

export function buildSections(type: SectionType, count = 30): SectionDef[] {
  const totalQuestions = type === "RW" ? 27 : 22;

  // Set reasonable defaults; can be updated later to official.
  // RW: 32 minutes, Math: 35 minutes (placeholder; adjust when ready)
  const timeLimitSeconds =
    type === "RW" ? 32 * 60 : 35 * 60;

  return Array.from({ length: count }, (_, i) => {
    const number = i + 1;
    const id = `${type}-${String(number).padStart(2, "0")}`;
    return {
      id,
      type,
      number,
      title: `${type === "RW" ? "RW" : "Math"} Section ${String(number).padStart(2, "0")}`,
      totalQuestions,
      timeLimitSeconds,
    };
  });
}
