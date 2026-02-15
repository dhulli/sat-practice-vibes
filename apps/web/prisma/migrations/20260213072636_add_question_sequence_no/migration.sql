-- 1) Add column as nullable first (safe for existing rows)
ALTER TABLE "Question" ADD COLUMN "sequenceNo" INTEGER;

-- 2) Backfill deterministically: per microSkill order by createdAt then id
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "microSkillId"
      ORDER BY "createdAt" ASC, id ASC
    ) AS rn
  FROM "Question"
)
UPDATE "Question" q
SET "sequenceNo" = ranked.rn
FROM ranked
WHERE ranked.id = q.id;

-- 3) Make it NOT NULL
ALTER TABLE "Question" ALTER COLUMN "sequenceNo" SET NOT NULL;

-- 4) Unique per microSkill
CREATE UNIQUE INDEX "Question_microSkillId_sequenceNo_key"
ON "Question" ("microSkillId", "sequenceNo");

-- 5) Helpful index for fetching in author order
CREATE INDEX "Question_microSkill_active_sequence_idx"
ON "Question" ("microSkillId", "active", "sequenceNo");
