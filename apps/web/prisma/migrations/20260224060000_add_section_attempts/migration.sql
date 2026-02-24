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
