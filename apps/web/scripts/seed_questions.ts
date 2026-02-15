import "dotenv/config";
import { prisma } from "@/lib/db";
import { QuestionType } from "@prisma/client";
import crypto from "crypto";

type Choice = { id: "A" | "B" | "C" | "D"; textHtml: string };

function uid() {
  return crypto.randomUUID();
}

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

function rwPassage(i: number, skillName: string) {
  const parts = [
    `<p><strong>Passage:</strong> In recent discussions of ${skillName}, researchers have emphasized that context can dramatically shift meaning. A term that sounds absolute in isolation may become qualified when placed beside evidence or limitations.</p>`,
    `<p>For example, a committee might describe a proposal as <em>pragmatic</em> not because it lacks ambition, but because it balances ambition with feasibility—choosing actions that are more likely to succeed under real constraints.</p>`,
    `<p>As a result, careful readers track how tone, qualifiers, and surrounding details shape interpretation.</p>`,
  ];
  // Slightly vary length to simulate real passages
  return parts.slice(0, 2 + (i % 2)).join("");
}

function rwQuestion(i: number) {
  const stems = [
    "In the passage, the word <em>pragmatic</em> most nearly means:",
    "Which choice best describes the author's main point?",
    "Which choice best supports the claim made in the passage?",
    "As used in the passage, the phrase <em>real constraints</em> most nearly refers to:",
    "Which choice best describes the function of the second paragraph?",
  ];
  return `<p>${pick(stems, i)}</p>`;
}

function rwChoices(i: number): { choices: Choice[]; correct: "A" | "B" | "C" | "D" } {
  const sets: Array<{ choices: Choice[]; correct: "A" | "B" | "C" | "D" }> = [
    {
      correct: "B",
      choices: [
        { id: "A", textHtml: "idealistic" },
        { id: "B", textHtml: "practical" },
        { id: "C", textHtml: "reckless" },
        { id: "D", textHtml: "uncertain" },
      ],
    },
    {
      correct: "C",
      choices: [
        { id: "A", textHtml: "It argues that context is irrelevant to meaning." },
        { id: "B", textHtml: "It criticizes committees for avoiding ambitious plans." },
        { id: "C", textHtml: "It explains how surrounding details shape interpretation." },
        { id: "D", textHtml: "It claims readers should ignore qualifiers." },
      ],
    },
    {
      correct: "A",
      choices: [
        { id: "A", textHtml: "limits like time, resources, or evidence" },
        { id: "B", textHtml: "imaginary obstacles invented for effect" },
        { id: "C", textHtml: "constraints that only apply to fiction" },
        { id: "D", textHtml: "rules that cannot be changed under any conditions" },
      ],
    },
  ];
  return pick(sets, i);
}

function mathQuestionHtml(i: number, skillName: string) {
  const stems = [
    `Solve for <strong>x</strong>: <span>3x + 7 = 28</span>.`,
    `If <strong>f(x) = 2x - 5</strong>, what is <strong>f(9)</strong>?`,
    `A rectangle has perimeter 30. If its length is 9, what is its width?`,
    `A store discounts a $80 item by 25%. What is the sale price?`,
    `If <strong>y = x^2</strong>, what is <strong>y</strong> when <strong>x = -4</strong>?`,
  ];
  return `<p><strong>${skillName}:</strong> ${pick(stems, i)}</p>`;
}

function mathMCQ(i: number) {
  const variants = [
    { correct: "C" as const, choices: ["5", "6", "7", "8"] },
    { correct: "A" as const, choices: ["13", "14", "15", "16"] },
    { correct: "D" as const, choices: ["9", "10", "11", "12"] },
  ];
  const v = pick(variants, i);
  const ids: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
  const choices: Choice[] = ids.map((id, idx) => ({ id, textHtml: v.choices[idx] }));
  return { correct: v.correct, choices };
}

function complexity(i: number) {
  return pick(["Easy", "Medium", "Hard"], i);
}

function explain(i: number) {
  const texts = [
    `<p>Use direct substitution or isolate the variable with inverse operations.</p>`,
    `<p>Compute step by step and keep track of arithmetic carefully.</p>`,
    `<p>Translate the words into an equation, then solve.</p>`,
  ];
  return pick(texts, i);
}

async function main() {
  const TARGET = 30;

  const skills = await prisma.microSkill.findMany({
    select: { id: true, code: true, name: true, section: true },
    orderBy: { code: "asc" },
  });

  console.log(`Found ${skills.length} micro-skills`);

  for (const s of skills) {
    const existing = await prisma.question.count({
      where: { microSkillId: s.id, active: true },
    });

    const need = Math.max(0, TARGET - existing);
    if (need === 0) {
      console.log(`✅ ${s.code} already has ${existing} active questions`);
      continue;
    }

    console.log(`➕ Seeding ${need} questions for ${s.code} (${s.name})`);

    const rows = Array.from({ length: need }, (_, j) => {
      const idx = existing + j;

      if (s.section.code === "RW") {
        const set = rwChoices(idx);
        return {
          id: uid(),
          microSkillId: s.id,
          questionType: QuestionType.RW_PASSAGE_MCQ,
          sequenceNo: idx,
          passageHtml: rwPassage(idx, s.name ?? s.code),
          questionHtml: rwQuestion(idx),
          choicesJson: set.choices,
          correctAnswer: set.correct,
          explanationHtml: `<p><em>${s.name ?? s.code}</em>: ${explain(idx)}</p>`,
          complexity: complexity(idx),
          complexityReasonHtml: `<p>Vocabulary/reading inference varies by distractors and qualifiers.</p>`,
          assetUrl: null,
          active: true,
        };
      }

      // MATH: mix MCQ and SPR
      const spr = idx % 3 === 0; // 1/3 SPR
      if (spr) {
        // simple numeric answer generation
        const correct = String((idx % 9) + 3);
        return {
          id: uid(),
          microSkillId: s.id,
          questionType: QuestionType.MATH_SPR,
          sequenceNo: idx,
          questionHtml: mathQuestionHtml(idx, s.name ?? s.code),
          correctAnswer: correct,
          explanationHtml: `<p>Work the equation and compute the numeric result.</p>`,
          complexity: complexity(idx),
          complexityReasonHtml: `<p>Student response requires computing the exact value (no guessing).</p>`,
          active: true,
        };
      }

      // MCQ
      const set = mathMCQ(idx);
      return {
        id: uid(),
        microSkillId: s.id,
        questionType: QuestionType.MATH_MCQ,
        sequenceNo: idx,
        questionHtml: mathQuestionHtml(idx, s.name ?? s.code),
        choicesJson: set.choices,
        correctAnswer: set.correct,
        explanationHtml: `<p>Compute and select the matching choice.</p>`,
        complexity: complexity(idx),
        complexityReasonHtml: `<p>Multiple-choice with distractors that reflect common mistakes.</p>`,
        active: true,
      };
    });

    await prisma.question.createMany({ data: rows });
  }

  console.log("✅ Done seeding questions.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  
