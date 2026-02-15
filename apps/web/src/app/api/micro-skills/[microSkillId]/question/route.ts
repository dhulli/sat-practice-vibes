export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/serverAuth";

function toArray(x: unknown): string[] {
  return Array.isArray(x) ? x : [];
}

function toSet(x: unknown): Set<string> {
  return new Set(toArray(x));
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ microSkillId: string }> }
) {
  try {
    const user = await requireUser();
    const { microSkillId } = await ctx.params;

    const session = await prisma.skillSession.findUnique({
      where: { userId_microSkillId: { userId: user.id, microSkillId } },
    });

    if (!session) return NextResponse.json({ error: "No active session. Start session first." }, { status: 400 });

    const skill = await prisma.microSkill.findUnique({
      where: { id: microSkillId },
      select: { id: true, name: true, code: true },
    });

    if (!skill)
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });

    const queue = toArray(session.queueJson);
    const nextQueue = toArray(session.nextQueueJson);
    const mastered = toSet(session.masteredJson);

    if (session.status === "MASTERED") {
      return NextResponse.json({
        done: true,
        session: { status: session.status, cycle: session.cycle },
        masteryPct: 100,
      });
    }

    const pos = Math.min(session.pos, Math.max(queue.length - 1, 0));
    const currentQuestionId = queue[pos];

    const q = await prisma.question.findUnique({
      where: { id: currentQuestionId },
      select: {
        id: true,
        questionType: true,
        passageHtml: true,
        questionHtml: true,
        choicesJson: true,
        explanationHtml: true,
        complexity: true,
        complexityReasonHtml: true,
        assetUrl: true,
        correctAnswer: true, // NOTE: we will NOT return this to client
      },
    });

    if (!q) return NextResponse.json({ error: "Question missing" }, { status: 500 });

    // cycle accuracy so far:
    // answeredSoFar = pos (0-based current), so answeredSoFar = pos
    // but we haven’t answered current yet, so answeredCount = pos
    const answeredCount = pos;
    const incorrectSoFar = nextQueue.length;
    const correctSoFar = Math.max(answeredCount - incorrectSoFar, 0);
    const cycleTotal = queue.length;
    const cycleAccuracyPct = cycleTotal > 0 ? Math.round((correctSoFar / Math.max(answeredCount, 1)) * 100) : 0;

    // overall mastery
    const totalQuestions = await prisma.question.count({ where: { microSkillId, active: true } });
    const masteredCount = mastered.size;
    const masteryPct = totalQuestions > 0 ? Math.round((masteredCount / totalQuestions) * 100) : 0;

    return NextResponse.json({
      done: false,
       skill: {
       id: skill.id,
       name: skill.name,
       code: skill.code,
      },
      session: {
        id: session.id,
        status: session.status,
        cycle: session.cycle,
        pos,
        queueLen: queue.length,
        nextQueueLen: nextQueue.length,
        masteredCount,
        totalQuestions,
        masteryPct,
        cycleAccuracyPct,
      },
      question: {
        id: q.id,
        type: q.questionType,
        passageHtml: q.passageHtml,
        questionHtml: q.questionHtml,
        choices: q.choicesJson,
        complexity: q.complexity,
        complexityReasonHtml: q.complexityReasonHtml,
        explanationHtml: q.explanationHtml,
        assetUrl: q.assetUrl,
      },
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    const status = err.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status });
  }
}
