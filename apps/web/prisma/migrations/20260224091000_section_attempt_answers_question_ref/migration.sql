-- AlterTable
ALTER TABLE "SectionAttemptAnswer" ADD COLUMN "questionRef" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SectionAttemptAnswer" ALTER COLUMN "questionId" DROP NOT NULL;

-- DropIndex
DROP INDEX "SectionAttemptAnswer_attemptId_questionId_key";

-- CreateIndex
CREATE UNIQUE INDEX "SectionAttemptAnswer_attemptId_questionRef_key" ON "SectionAttemptAnswer"("attemptId", "questionRef");

-- Drop and recreate FK
ALTER TABLE "SectionAttemptAnswer" DROP CONSTRAINT "SectionAttemptAnswer_questionId_fkey";
ALTER TABLE "SectionAttemptAnswer" ADD CONSTRAINT "SectionAttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
