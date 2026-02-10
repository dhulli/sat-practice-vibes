export type RwChoiceId = "A" | "B" | "C" | "D";

export type RwQuestion = {
  id: string; // stable like RW-S01-Q01
  paragraphHtml: string; // can be long
  questionHtml: string;
  choices: { id: RwChoiceId; text: string }[];
};

export function buildMockRwSection(total = 27): RwQuestion[] {
  return Array.from({ length: total }, (_, i) => {
    const n = i + 1;
    const pad = String(n).padStart(2, "0");
    return {
      id: `RW-S01-Q${pad}`,
      paragraphHtml: `
        <p><strong>Paragraph ${n}.</strong> The artisans of the Igun Eronmwon guild in Benin City, Nigeria, typically _____ the bronze- and brass-casting techniques passed down through their families since the thirteenth century.</p>
        <p>But they don’t strictly observe every tradition; for example, guild members now use air-conditioning motors instead of handheld bellows to help heat their forges. This longer paragraph is here to test scrolling behavior. Repeat: the guild’s practices show continuity and adaptation over time.</p>
      `,
      questionHtml: `<p>Which choice completes the text with the most logical and precise word or phrase?</p>`,
      choices: [
        { id: "A", text: "experiment with" },
        { id: "B", text: "adhere to" },
        { id: "C", text: "improve on" },
        { id: "D", text: "grapple with" },
      ],
    };
  });
}
