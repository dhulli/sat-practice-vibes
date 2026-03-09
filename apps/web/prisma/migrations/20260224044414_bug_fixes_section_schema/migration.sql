/*
  Warnings:

  - You are about to drop the column `categoryBreakdownJson` on the `SectionAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `endsAt` on the `SectionAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `expiredAt` on the `SectionAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `scoreCorrect` on the `SectionAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `scorePct` on the `SectionAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `scoreTotal` on the `SectionAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `SectionAttempt` table. All the data in the column will be lost.
  - The `status` column on the `SectionAttempt` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `sectionId` on table `SectionAttempt` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sectionType` on table `SectionAttempt` required. This step will fail if there are existing NULL values in that column.
  - Made the column `attemptNo` on table `SectionAttempt` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currentIndex` on table `SectionAttempt` required. This step will fail if there are existing NULL values in that column.
  - Made the column `remainingSeconds` on table `SectionAttempt` required. This step will fail if there are existing NULL values in that column.
  - Made the column `selectedJson` on table `SectionAttempt` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reviewJson` on table `SectionAttempt` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "SectionAttempt" DROP CONSTRAINT "SectionAttempt_practiceSectionId_fkey";

-- DropIndex
DROP INDEX "Question_microSkillId_active_sequenceNo_idx";

-- DropIndex
DROP INDEX "Question_microSkillId_sequenceNo_key";

-- DropIndex
DROP INDEX "SectionAttempt_userId_practiceSectionId_startedAt_idx";

-- AlterTable
ALTER TABLE "SectionAttempt" DROP COLUMN "categoryBreakdownJson",
DROP COLUMN "endsAt",
DROP COLUMN "expiredAt",
DROP COLUMN "scoreCorrect",
DROP COLUMN "scorePct",
DROP COLUMN "scoreTotal",
DROP COLUMN "submittedAt",
ALTER COLUMN "practiceSectionId" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "SectionAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
ALTER COLUMN "sectionId" SET NOT NULL,
ALTER COLUMN "sectionType" SET NOT NULL,
ALTER COLUMN "attemptNo" SET NOT NULL,
ALTER COLUMN "currentIndex" SET NOT NULL,
ALTER COLUMN "remainingSeconds" SET NOT NULL,
ALTER COLUMN "selectedJson" SET NOT NULL,
ALTER COLUMN "reviewJson" SET NOT NULL;

-- AlterTable
ALTER TABLE "SectionAttemptAnswer" ALTER COLUMN "questionRef" DROP DEFAULT;

-- DropEnum
DROP TYPE "AttemptStatus";

-- CreateIndex
CREATE INDEX "SectionAttempt_userId_status_idx" ON "SectionAttempt"("userId", "status");

-- AddForeignKey
ALTER TABLE "SectionAttempt" ADD CONSTRAINT "SectionAttempt_practiceSectionId_fkey" FOREIGN KEY ("practiceSectionId") REFERENCES "PracticeSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
DO $$
BEGIN
  CREATE TYPE "SectionAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EXITED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
-- CreateEnum (idempotent for branch-merge/local shadow collisions)
DO $$
BEGIN
  CREATE TYPE "SectionAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EXITED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "SectionAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "sectionType" "SectionCode" NOT NULL,
    "attemptNo" INTEGER NOT NULL,
    "status" "SectionAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "remainingSeconds" INTEGER NOT NULL DEFAULT 0,
    "selectedJson" JSONB NOT NULL DEFAULT '{}',
    "reviewJson" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectionAttempt_pkey" PRIMARY KEY ("id")
);

-- Ensure required columns exist when table already came from another branch shape
ALTER TABLE "SectionAttempt" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "SectionAttempt" ADD COLUMN IF NOT EXISTS "sectionId" TEXT;
ALTER TABLE "SectionAttempt" ADD COLUMN IF NOT EXISTS "sectionType" "SectionCode";
ALTER TABLE "SectionAttempt" ADD COLUMN IF NOT EXISTS "attemptNo" INTEGER;
ALTER TABLE "SectionAttempt" ADD COLUMN IF NOT EXISTS "status" "SectionAttemptStatus" DEFAULT 'IN_PROGRESS';
ALTER TABLE "SectionAttempt" ADD COLUMN IF NOT EXISTS "currentIndex" INTEGER DEFAULT 0;
ALTER TABLE "SectionAttempt" ADD COLUMN IF NOT EXISTS "remainingSeconds" INTEGER DEFAULT 0;
ALTER TABLE "SectionAttempt" ADD COLUMN IF NOT EXISTS "selectedJson" JSONB DEFAULT '{}';
ALTER TABLE "SectionAttempt" ADD COLUMN IF NOT EXISTS "reviewJson" JSONB DEFAULT '{}';
ALTER TABLE "SectionAttempt" ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "SectionAttempt" ADD COLUMN IF NOT EXISTS "endedAt" TIMESTAMP(3);
ALTER TABLE "SectionAttempt" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "SectionAttempt" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SectionAttempt_userId_sectionId_idx" ON "SectionAttempt"("userId", "sectionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SectionAttempt_userId_status_idx" ON "SectionAttempt"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SectionAttempt_userId_sectionId_attemptNo_key" ON "SectionAttempt"("userId", "sectionId", "attemptNo");

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "SectionAttempt" ADD CONSTRAINT "SectionAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
