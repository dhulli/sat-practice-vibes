import "dotenv/config";
import { PrismaClient, SectionCode, QuestionType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // wipe in dev
  await prisma.skillSession.deleteMany();
  await prisma.skillProgress.deleteMany();
  await prisma.question.deleteMany();
  await prisma.microSkill.deleteMany();
  await prisma.category.deleteMany();
  await prisma.section.deleteMany();

  const rw = await prisma.section.create({ data: { code: SectionCode.RW, name: "Reading & Writing" } });
  const math = await prisma.section.create({ data: { code: SectionCode.MATH, name: "Math" } });

  const rwCats = await prisma.category.createManyAndReturn({
    data: [
      { sectionId: rw.id, name: "Craft and Structure", order: 1 },
      { sectionId: rw.id, name: "Information and Ideas", order: 2 },
      { sectionId: rw.id, name: "Standard English Conventions", order: 3 },
      { sectionId: rw.id, name: "Expression of Ideas", order: 4 },
    ],
  });

  const mCats = await prisma.category.createManyAndReturn({
    data: [
      { sectionId: math.id, name: "Algebra", order: 1 },
      { sectionId: math.id, name: "Advanced Math", order: 2 },
      { sectionId: math.id, name: "Problem-Solving and Data Analysis", order: 3 },
      { sectionId: math.id, name: "Geometry and Trigonometry", order: 4 },
    ],
  });

  // Seed a few micro-skills only (we’ll scale later)
  const ms1 = await prisma.microSkill.create({
    data: {
      sectionId: rw.id,
      categoryId: rwCats[0].id,
      code: "RW-MS-001",
      name: "Words in Context",
      order: 1,
    },
  });

  const ms2 = await prisma.microSkill.create({
    data: {
      sectionId: rw.id,
      categoryId: rwCats[1].id,
      code: "RW-MS-002",
      name: "Main Idea",
      order: 2,
    },
  });

  const ms3 = await prisma.microSkill.create({
    data: {
      sectionId: math.id,
      categoryId: mCats[0].id,
      code: "MATH-MS-001",
      name: "Linear Equations",
      order: 1,
    },
  });

  // Questions (3 per skill for now)
  await prisma.question.createMany({
    data: [
      {
        microSkillId: ms1.id,
        questionType: QuestionType.RW_PASSAGE_MCQ,
        sequenceNo: 0,
        passageHtml: `<p><strong>Passage:</strong> The committee found the proposal <em>pragmatic</em>, balancing ambition with feasibility.</p>`,
        questionHtml: `<p>In the passage, the word <em>pragmatic</em> most nearly means:</p>`,
        choicesJson: [
          { id: "A", textHtml: "idealistic" },
          { id: "B", textHtml: "practical" },
          { id: "C", textHtml: "reckless" },
          { id: "D", textHtml: "uncertain" },
        ],
        correctAnswer: "B",
        explanationHtml: `<p><em>Pragmatic</em> means practical and focused on what will work.</p>`,
        complexity: "Easy",
        complexityReasonHtml: `<p>Direct vocabulary-in-context with clear clue (“feasibility”).</p>`,
      },
      {
        microSkillId: ms1.id,
        questionType: QuestionType.RW_PASSAGE_MCQ,
        sequenceNo: 1,
        passageHtml: `<p>The scientist offered a <em>tentative</em> conclusion, noting that more data was needed.</p>`,
        questionHtml: `<p>The word <em>tentative</em> most nearly means:</p>`,
        choicesJson: [
          { id: "A", textHtml: "certain" },
          { id: "B", textHtml: "hesitant" },
          { id: "C", textHtml: "final" },
          { id: "D", textHtml: "careless" },
        ],
        correctAnswer: "B",
        explanationHtml: `<p><em>Tentative</em> suggests not final—uncertain or hesitant.</p>`,
        complexity: "Easy",
        complexityReasonHtml: `<p>Clear clue (“more data was needed”).</p>`,
      },
      {
        microSkillId: ms2.id,
        questionType: QuestionType.RW_PASSAGE_MCQ,
        sequenceNo: 0,
        passageHtml: `<p>City planners proposed adding bike lanes to reduce traffic and improve public health.</p>`,
        questionHtml: `<p>Which choice best states the main idea?</p>`,
        choicesJson: [
          { id: "A", textHtml: "Bike lanes are expensive to build." },
          { id: "B", textHtml: "Planners want bike lanes to reduce traffic and improve health." },
          { id: "C", textHtml: "Traffic is unavoidable in cities." },
          { id: "D", textHtml: "Public health depends only on exercise." },
        ],
        correctAnswer: "B",
        explanationHtml: `<p>The passage states the purpose: reduce traffic and improve public health.</p>`,
        complexity: "Easy",
        complexityReasonHtml: `<p>Main idea is explicitly stated.</p>`,
      },
      {
        microSkillId: ms3.id,
        questionType: QuestionType.MATH_SPR,
        sequenceNo: 0,
        questionHtml: `<p>Solve for <strong>x</strong>: 3x + 5 = 20</p>`,
        correctAnswer: "5",
        explanationHtml: `<p>3x = 15, so x = 5.</p>`,
        complexity: "Easy",
        complexityReasonHtml: `<p>Single-step linear equation after subtraction.</p>`,
      },
      {
        microSkillId: ms3.id,
        questionType: QuestionType.MATH_MCQ,
        sequenceNo: 1,
        questionHtml: `<p>What is the value of <strong>y</strong> if 2y = 18?</p>`,
        choicesJson: [
          { id: "A", textHtml: "7" },
          { id: "B", textHtml: "8" },
          { id: "C", textHtml: "9" },
          { id: "D", textHtml: "10" },
        ],
        correctAnswer: "C",
        explanationHtml: `<p>Divide both sides by 2: y = 9.</p>`,
        complexity: "Easy",
        complexityReasonHtml: `<p>Direct division.</p>`,
      },
    ],
  });

  console.log("Seed complete ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
