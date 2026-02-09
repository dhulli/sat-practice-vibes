export type SkillQuestion = {
  id: string; // stable within skill
  passageHtml?: string; // you prefer HTML, so we use HTML string
  questionHtml: string; // HTML for formatting
  choices?: { id: "A" | "B" | "C" | "D"; textHtml: string }[];
  correctAnswer: string; // for mcq: "A"/"B"/... ; for spr: exact string
  explanationHtml: string;
  complexity: "Easy" | "Medium" | "Hard";
  complexityReasonHtml: string;
  kind: "mcq" | "spr";
};

function seeded(skillId: string) {
  let h = 0;
  for (let i = 0; i < skillId.length; i++) h = (h * 31 + skillId.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 2 ** 32;
  };
}

function pick<T>(r: () => number, arr: T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

export function buildMockSkillQuestions(skillId: string, count = 30): SkillQuestion[] {
  const r = seeded(skillId);

  const complexities: SkillQuestion["complexity"][] = ["Easy", "Medium", "Hard"];
  const kinds: SkillQuestion["kind"][] = ["mcq", "spr"];

  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const complexity = pick(r, complexities);
    const kind = pick(r, kinds);

    const passageHtml =
      skillId.startsWith("RW-")
        ? `<p><strong>Passage:</strong> This is a short informational blurb for <em>${skillId}</em> (Q${n}).</p>`
        : undefined;

    if (kind === "mcq") {
      const correct = pick(r, ["A", "B", "C", "D"] as const);
      return {
        id: `${skillId}-Q${String(n).padStart(2, "0")}`,
        kind,
        passageHtml,
        questionHtml: `<p>Choose the best answer for <strong>${skillId}</strong> (Question ${n}).</p>`,
        choices: [
          { id: "A", textHtml: `<p>Choice A</p>` },
          { id: "B", textHtml: `<p>Choice B</p>` },
          { id: "C", textHtml: `<p>Choice C</p>` },
          { id: "D", textHtml: `<p>Choice D</p>` },
        ],
        correctAnswer: correct,
        explanationHtml: `<p>The correct answer is <strong>${correct}</strong>. This explanation is mocked for now but shaped for production.</p>`,
        complexity,
        complexityReasonHtml: `<p>This is <strong>${complexity}</strong> because it requires a typical SAT step at this level.</p>`,
      };
    }

    // spr
    const correctAnswer = String(Math.floor(r() * 10) + 5); // 5..14
    return {
      id: `${skillId}-Q${String(n).padStart(2, "0")}`,
      kind,
      passageHtml,
      questionHtml: `<p>Enter the correct value for <strong>${skillId}</strong> (Question ${n}).</p>`,
      correctAnswer,
      explanationHtml: `<p>The correct value is <strong>${correctAnswer}</strong>. Explanation is mocked.</p>`,
      complexity,
      complexityReasonHtml: `<p>This is <strong>${complexity}</strong> due to the reasoning steps required.</p>`,
    };
  });
}
