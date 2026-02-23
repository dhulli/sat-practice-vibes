-- CreateEnum
CREATE TYPE "PracticeSectionType" AS ENUM ('RW', 'MATH');

-- AlterTable
ALTER TABLE "SectionAttempt" ADD COLUMN "practiceSectionId" TEXT;

-- CreateTable
CREATE TABLE "PracticeSection" (
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

-- CreateTable
CREATE TABLE "PracticeSectionQuestion" (
    "id" TEXT NOT NULL,
    "practiceSectionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sequenceNo" INTEGER NOT NULL,

    CONSTRAINT "PracticeSectionQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionAttemptAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SectionAttemptAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeSection_code_key" ON "PracticeSection"("code");

-- CreateIndex
CREATE INDEX "PracticeSection_type_active_idx" ON "PracticeSection"("type", "active");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeSectionQuestion_practiceSectionId_sequenceNo_key" ON "PracticeSectionQuestion"("practiceSectionId", "sequenceNo");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeSectionQuestion_practiceSectionId_questionId_key" ON "PracticeSectionQuestion"("practiceSectionId", "questionId");

-- CreateIndex
CREATE INDEX "PracticeSectionQuestion_practiceSectionId_sequenceNo_idx" ON "PracticeSectionQuestion"("practiceSectionId", "sequenceNo");

-- CreateIndex
CREATE UNIQUE INDEX "SectionAttemptAnswer_attemptId_questionId_key" ON "SectionAttemptAnswer"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX "SectionAttemptAnswer_attemptId_idx" ON "SectionAttemptAnswer"("attemptId");

-- CreateIndex
CREATE INDEX "SectionAttempt_practiceSectionId_idx" ON "SectionAttempt"("practiceSectionId");

-- AddForeignKey
ALTER TABLE "SectionAttempt" ADD CONSTRAINT "SectionAttempt_practiceSectionId_fkey" FOREIGN KEY ("practiceSectionId") REFERENCES "PracticeSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSectionQuestion" ADD CONSTRAINT "PracticeSectionQuestion_practiceSectionId_fkey" FOREIGN KEY ("practiceSectionId") REFERENCES "PracticeSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSectionQuestion" ADD CONSTRAINT "PracticeSectionQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionAttemptAnswer" ADD CONSTRAINT "SectionAttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "SectionAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionAttemptAnswer" ADD CONSTRAINT "SectionAttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
