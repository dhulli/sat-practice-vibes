export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/serverAuth";

function toArray(x: unknown): string[] {
  return Array.isArray(x) ? x : [];
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ microSkillId: string }> }
) {
  try {
    const user = await requireUser();
    const { microSkillId } = await ctx.params;

    // Ensure skill exists
    const skill = await prisma.microSkill.findUnique({
      where: { id: microSkillId },
      select: { id: true, name: true },
    });
    if (!skill) return NextResponse.json({ error: "Skill not found" }, { status: 404 });

    // Pull active questions (we’ll later enforce exactly 30)
    const questions = await prisma.question.findMany({
    where: { microSkillId, active: true },
    orderBy: { sequenceNo: "asc" },   // ✅ author-controlled order
    take: 30,                          // ✅ enforce 30 per session
    select: { id: true },
    });

    if (questions.length === 0) {
      return NextResponse.json({ error: "No questions for this skill" }, { status: 400 });
    }

    const totalQuestions = questions.length;
    const allIds = questions.map((q) => q.id);

    // Upsert progress row (keeps mastery on main page)
    await prisma.skillProgress.upsert({
      where: { userId_microSkillId: { userId: user.id, microSkillId } },
      create: { userId: user.id, microSkillId, masteryPct: 0, masteredCount: 0, totalQuestions },
      update: { totalQuestions },
    });

    // Session upsert: if exists and IN_PROGRESS -> resume, else create new
    const existing = await prisma.skillSession.findUnique({
      where: { userId_microSkillId: { userId: user.id, microSkillId } },
    });

    if (existing && existing.status === "IN_PROGRESS") {
      const queue = toArray(existing.queueJson);
      const pos = Math.min(existing.pos, Math.max(queue.length - 1, 0));
      return NextResponse.json({
        session: {
          id: existing.id,
          status: existing.status,
          cycle: existing.cycle,
          pos,
          queueLen: queue.length,
        },
        totalQuestions,
      });
    }

    // Start fresh cycle 1
    const session = await prisma.skillSession.upsert({
      where: { userId_microSkillId: { userId: user.id, microSkillId } },
      create: {
        userId: user.id,
        microSkillId,
        status: "IN_PROGRESS",
        cycle: 1,
        queueJson: allIds,
        pos: 0,
        nextQueueJson: [],
        masteredJson: [],
      },
      update: {
        status: "IN_PROGRESS",
        cycle: 1,
        queueJson: allIds,
        pos: 0,
        nextQueueJson: [],
        masteredJson: [],
      },
    });

    return NextResponse.json({
      session: { id: session.id, status: session.status, cycle: session.cycle, pos: session.pos, queueLen: allIds.length },
      totalQuestions,
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    const status = err.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status });
  }
}
