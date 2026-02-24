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
