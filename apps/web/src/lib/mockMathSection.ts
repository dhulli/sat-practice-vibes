export type MathChoiceId = "A" | "B" | "C" | "D";

export type MathQuestion = {
  id: string;
  stimulusHtml?: string;
  questionHtml: string;
  kind: "mcq" | "spr";
  choices?: { id: MathChoiceId; text: string }[];
};

export function buildMockMathSection(total = 22): MathQuestion[] {
  return Array.from({ length: total }, (_, i) => {
    const n = i + 1;
    const pad = String(n).padStart(2, "0");
    const even = n % 2 === 0;

    if (even) {
      return {
        id: `MATH-S01-Q${pad}`,
        stimulusHtml: `<p>A line in the xy-plane passes through (0, ${n}) and (2, ${n + 6}).</p>`,
        questionHtml: "<p>What is the slope of the line?</p>",
        kind: "spr",
      };
    }

    return {
      id: `MATH-S01-Q${pad}`,
      stimulusHtml: `<p>Function f is defined by f(x) = x<sup>2</sup> - ${n}x + 6.</p>`,
      questionHtml: "<p>Which value of x is a solution to f(x) = 0?</p>",
      kind: "mcq",
      choices: [
        { id: "A", text: "1" },
        { id: "B", text: "2" },
        { id: "C", text: "3" },
        { id: "D", text: "6" },
      ],
    };
  });
}
