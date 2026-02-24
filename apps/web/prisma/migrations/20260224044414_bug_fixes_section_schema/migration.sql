<<<<<<< HEAD
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
=======
-- Compatibility shim for local migration-order drift.
-- Some environments have this migration timestamp before add_section_attempts,
-- but contain statements that reference SectionAttemptStatus.
-- Ensure enum exists so later/duplicated DDL can run safely.
DO $$
BEGIN
  CREATE TYPE "SectionAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EXITED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
>>>>>>> 1acf142be4745c0fc14b279f7feeb18311657f38
