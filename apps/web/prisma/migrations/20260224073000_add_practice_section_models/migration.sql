-- CreateEnum (idempotent)
DO $$
BEGIN
  CREATE TYPE "PracticeSectionType" AS ENUM ('RW', 'MATH');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "SectionAttempt" ADD COLUMN IF NOT EXISTS "practiceSectionId" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "PracticeSection" (
    "id" TEXT NOT NULL,
    "type" "PracticeSectionType" NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeSection_pkey" PRIMARY KEY ("id")
);

-- Ensure columns if table already exists
ALTER TABLE "PracticeSection" ADD COLUMN IF NOT EXISTS "type" "PracticeSectionType";
ALTER TABLE "PracticeSection" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "PracticeSection" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "PracticeSection" ADD COLUMN IF NOT EXISTS "durationSec" INTEGER;
ALTER TABLE "PracticeSection" ADD COLUMN IF NOT EXISTS "active" BOOLEAN DEFAULT true;
ALTER TABLE "PracticeSection" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "PracticeSection" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PracticeSectionQuestion" (
    "id" TEXT NOT NULL,
    "practiceSectionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sequenceNo" INTEGER NOT NULL,

    CONSTRAINT "PracticeSectionQuestion_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PracticeSectionQuestion" ADD COLUMN IF NOT EXISTS "practiceSectionId" TEXT;
ALTER TABLE "PracticeSectionQuestion" ADD COLUMN IF NOT EXISTS "questionId" TEXT;
ALTER TABLE "PracticeSectionQuestion" ADD COLUMN IF NOT EXISTS "sequenceNo" INTEGER;

-- CreateTable
CREATE TABLE IF NOT EXISTS "SectionAttemptAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SectionAttemptAnswer_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SectionAttemptAnswer" ADD COLUMN IF NOT EXISTS "attemptId" TEXT;
ALTER TABLE "SectionAttemptAnswer" ADD COLUMN IF NOT EXISTS "questionId" TEXT;
ALTER TABLE "SectionAttemptAnswer" ADD COLUMN IF NOT EXISTS "answer" TEXT;
ALTER TABLE "SectionAttemptAnswer" ADD COLUMN IF NOT EXISTS "isCorrect" BOOLEAN DEFAULT false;
ALTER TABLE "SectionAttemptAnswer" ADD COLUMN IF NOT EXISTS "answeredAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PracticeSection_code_key" ON "PracticeSection"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PracticeSection_type_active_idx" ON "PracticeSection"("type", "active");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PracticeSectionQuestion_practiceSectionId_sequenceNo_key" ON "PracticeSectionQuestion"("practiceSectionId", "sequenceNo");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PracticeSectionQuestion_practiceSectionId_questionId_key" ON "PracticeSectionQuestion"("practiceSectionId", "questionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PracticeSectionQuestion_practiceSectionId_sequenceNo_idx" ON "PracticeSectionQuestion"("practiceSectionId", "sequenceNo");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SectionAttemptAnswer_attemptId_questionId_key" ON "SectionAttemptAnswer"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SectionAttemptAnswer_attemptId_idx" ON "SectionAttemptAnswer"("attemptId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SectionAttempt_practiceSectionId_idx" ON "SectionAttempt"("practiceSectionId");

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "SectionAttempt" ADD CONSTRAINT "SectionAttempt_practiceSectionId_fkey" FOREIGN KEY ("practiceSectionId") REFERENCES "PracticeSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "PracticeSectionQuestion" ADD CONSTRAINT "PracticeSectionQuestion_practiceSectionId_fkey" FOREIGN KEY ("practiceSectionId") REFERENCES "PracticeSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "PracticeSectionQuestion" ADD CONSTRAINT "PracticeSectionQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "SectionAttemptAnswer" ADD CONSTRAINT "SectionAttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "SectionAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "SectionAttemptAnswer" ADD CONSTRAINT "SectionAttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
