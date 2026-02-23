-- CreateEnum
CREATE TYPE "SectionAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EXITED');

-- CreateTable
CREATE TABLE "SectionAttempt" (
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
CREATE INDEX "SectionAttempt_userId_sectionId_idx" ON "SectionAttempt"("userId", "sectionId");

-- CreateIndex
CREATE INDEX "SectionAttempt_userId_status_idx" ON "SectionAttempt"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SectionAttempt_userId_sectionId_attemptNo_key" ON "SectionAttempt"("userId", "sectionId", "attemptNo");

-- AddForeignKey
ALTER TABLE "SectionAttempt" ADD CONSTRAINT "SectionAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
