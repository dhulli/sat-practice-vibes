-- CreateEnum
CREATE TYPE "SectionCode" AS ENUM ('RW', 'MATH');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('RW_PASSAGE_MCQ', 'MATH_MCQ', 'MATH_SPR', 'GRAPH_MCQ');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'MASTERED');

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "code" "SectionCode" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MicroSkill" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MicroSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "microSkillId" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "passageHtml" TEXT,
    "questionHtml" TEXT NOT NULL,
    "choicesJson" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "explanationHtml" TEXT NOT NULL,
    "complexity" TEXT NOT NULL,
    "complexityReasonHtml" TEXT NOT NULL,
    "assetUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "microSkillId" TEXT NOT NULL,
    "masteryPct" INTEGER NOT NULL DEFAULT 0,
    "masteredCount" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "microSkillId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "cycle" INTEGER NOT NULL DEFAULT 1,
    "queueJson" JSONB NOT NULL,
    "pos" INTEGER NOT NULL DEFAULT 0,
    "nextQueueJson" JSONB NOT NULL DEFAULT '[]',
    "masteredJson" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Section_code_key" ON "Section"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MicroSkill_code_key" ON "MicroSkill"("code");

-- CreateIndex
CREATE INDEX "MicroSkill_sectionId_idx" ON "MicroSkill"("sectionId");

-- CreateIndex
CREATE INDEX "MicroSkill_categoryId_idx" ON "MicroSkill"("categoryId");

-- CreateIndex
CREATE INDEX "Question_microSkillId_idx" ON "Question"("microSkillId");

-- CreateIndex
CREATE INDEX "Question_questionType_idx" ON "Question"("questionType");

-- CreateIndex
CREATE INDEX "SkillProgress_microSkillId_idx" ON "SkillProgress"("microSkillId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillProgress_userId_microSkillId_key" ON "SkillProgress"("userId", "microSkillId");

-- CreateIndex
CREATE INDEX "SkillSession_userId_idx" ON "SkillSession"("userId");

-- CreateIndex
CREATE INDEX "SkillSession_microSkillId_idx" ON "SkillSession"("microSkillId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillSession_userId_microSkillId_key" ON "SkillSession"("userId", "microSkillId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroSkill" ADD CONSTRAINT "MicroSkill_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroSkill" ADD CONSTRAINT "MicroSkill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_microSkillId_fkey" FOREIGN KEY ("microSkillId") REFERENCES "MicroSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillProgress" ADD CONSTRAINT "SkillProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillProgress" ADD CONSTRAINT "SkillProgress_microSkillId_fkey" FOREIGN KEY ("microSkillId") REFERENCES "MicroSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillSession" ADD CONSTRAINT "SkillSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillSession" ADD CONSTRAINT "SkillSession_microSkillId_fkey" FOREIGN KEY ("microSkillId") REFERENCES "MicroSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
