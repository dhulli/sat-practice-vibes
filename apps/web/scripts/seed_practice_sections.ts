import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PracticeSectionType, PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
  log: ["error", "warn"],
});

// (optional) fail fast if env missing
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

type BlueprintSection = {
  code: string;
  name: string;
  durationSec: number;
  questionIds: string[];
};

type Blueprint = {
  version: number;
  rw: BlueprintSection[];
  math: BlueprintSection[];
};

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

async function validateQuestionsExist(sectionType: "RW" | "MATH", ids: string[]) {
  // Validate existence + active + type rules
  const allowedTypes =
    sectionType === "RW"
      ? ["RW_PASSAGE_MCQ"]
      : ["MATH_MCQ", "MATH_SPR"]; // GRAPH_MCQ later

  const rows = await prisma.question.findMany({
    where: { id: { in: ids } },
    select: { id: true, active: true, questionType: true },
  });

  const found = new Set(rows.map((r) => r.id));
  const missing = ids.filter((id) => !found.has(id));
  assert(missing.length === 0, `[${sectionType}] Missing questionIds: ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? "..." : ""}`);

  const inactive = rows.filter((r) => !r.active).map((r) => r.id);
  assert(inactive.length === 0, `[${sectionType}] Inactive questions referenced: ${inactive.slice(0, 10).join(", ")}${inactive.length > 10 ? "..." : ""}`);

  const badType = rows
    .filter((r) => !allowedTypes.includes(r.questionType))
    .map((r) => `${r.id}(${r.questionType})`);

  assert(badType.length === 0, `[${sectionType}] Wrong questionType referenced: ${badType.slice(0, 10).join(", ")}${badType.length > 10 ? "..." : ""}`);
}

async function upsertSection(type: PracticeSectionType, s: BlueprintSection) {
  return prisma.practiceSection.upsert({
    where: { code: s.code },
    create: {
      type,
      code: s.code,
      name: s.name,
      durationSec: s.durationSec,
      active: true,
    },
    update: {
      type,
      name: s.name,
      durationSec: s.durationSec,
      active: true,
    },
    select: { id: true, code: true },
  });
}

async function seedOne(type: "RW" | "MATH", s: BlueprintSection) {
  const expectedCount = type === "RW" ? 27 : 22;

  assert(Array.isArray(s.questionIds), `${s.code}: questionIds must be an array`);
  assert(s.questionIds.length === expectedCount, `${s.code}: expected ${expectedCount} questions, got ${s.questionIds.length}`);

  const u = uniq(s.questionIds);
  assert(u.length === s.questionIds.length, `${s.code}: duplicate questionIds found`);

  await validateQuestionsExist(type, s.questionIds);

  const ps = await upsertSection(type === "RW" ? "RW" : "MATH", s);

  // Replace mapping cleanly (idempotent): delete then recreate
  await prisma.practiceSectionQuestion.deleteMany({
    where: { practiceSectionId: ps.id },
  });

  await prisma.practiceSectionQuestion.createMany({
    data: s.questionIds.map((questionId, i) => ({
      practiceSectionId: ps.id,
      questionId,
      sequenceNo: i + 1,
    })),
  });

  console.log(`✅ Seeded ${s.code} (${type}) with ${expectedCount} questions`);
}

async function main() {
  const file = path.join(process.cwd(), "scripts", "blueprints", "practice_sections.v1.json");
  const raw = fs.readFileSync(file, "utf8");
  const bp = JSON.parse(raw) as Blueprint;

  console.log(`Found ${bp.rw?.length} RW sections in blueprint`);
  console.log(`Found ${bp.math?.length} Math sections in blueprint`);

  assert(bp.version === 1, `Blueprint version must be 1`);
  assert(bp.rw?.length === 30, `Blueprint must contain exactly 30 RW sections`);
  assert(bp.math?.length === 30, `Blueprint must contain exactly 30 Math sections`);

  // Optional: enforce codes match expected
  for (let i = 0; i < 30; i++) {
    const wantRW = `RW-SEC-${String(i + 1).padStart(3, "0")}`;
    const wantM = `MATH-SEC-${String(i + 1).padStart(3, "0")}`;
    assert(bp.rw[i].code === wantRW, `RW index ${i} code must be ${wantRW}, got ${bp.rw[i].code}`);
    assert(bp.math[i].code === wantM, `MATH index ${i} code must be ${wantM}, got ${bp.math[i].code}`);
  }

  for (const s of bp.rw) await seedOne("RW", s);
  for (const s of bp.math) await seedOne("MATH", s);

  console.log("🎉 Practice sections seeded successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });  
