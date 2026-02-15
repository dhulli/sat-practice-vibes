-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "sequenceNo" DROP NOT NULL;

-- RenameIndex
ALTER INDEX "Question_microSkill_active_sequence_idx" RENAME TO "Question_microSkillId_active_sequenceNo_idx";
