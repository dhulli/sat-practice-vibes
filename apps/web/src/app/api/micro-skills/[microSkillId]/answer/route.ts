export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/serverAuth";

const Body = z.object({
  questionId: z.string().uuid(),
  answer: z.string().min(1).max(50),
});

function toArray(x: unknown): string[] {
  return Array.isArray(x) ? x : [];
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ microSkillId: string }> }
) {
  try {
    const user = await requireUser();
    const { microSkillId } = await ctx.params;
    const body = Body.parse(await req.json());

    const session = await prisma.skillSession.findUnique({
      where: { userId_microSkillId: { userId: user.id, microSkillId } },
    });
    if (!session) return NextResponse.json({ error: "No active session. Start session first." }, { status: 400 });
    if (session.status !== "IN_PROGRESS") return NextResponse.json({ error: "Session already completed." }, { status: 400 });

    const queue = toArray(session.queueJson);
    const nextQueue = toArray(session.nextQueueJson);
    const mastered = toArray(session.masteredJson);

    const pos = Math.min(session.pos, Math.max(queue.length - 1, 0));
    const currentQuestionId = queue[pos];

    // Enforce: you can only answer the current question
    if (body.questionId !== currentQuestionId) {
      return NextResponse.json({ error: "You can only answer the current question." }, { status: 409 });
    }

    const q = await prisma.question.findUnique({
      where: { id: currentQuestionId },
      select: { id: true, correctAnswer: true, questionType: true },
    });
    if (!q) return NextResponse.json({ error: "Question missing" }, { status: 500 });

    const userAnswer = body.answer.trim();
    const correctAnswer = q.correctAnswer.trim();
    const correct =
      q.questionType === "MATH_SPR"
        ? userAnswer === correctAnswer
        : userAnswer.toUpperCase() === correctAnswer.toUpperCase();

    let newNextQueue = nextQueue;
    let newMastered = mastered;

    if (correct) {
      newMastered = uniq([...newMastered, q.id]);
    } else {
      // incorrect goes into next cycle queue (in order)
      newNextQueue = [...newNextQueue, q.id];
    }

    // advance position
    const atEndAfterThis = pos >= queue.length - 1;

    if (!atEndAfterThis) {
      const updated = await prisma.skillSession.update({
        where: { userId_microSkillId: { userId: user.id, microSkillId } },
        data: {
          pos: pos + 1,
          nextQueueJson: newNextQueue,
          masteredJson: newMastered,
        },
      });

      // update progress
      const totalQuestions = await prisma.question.count({ where: { microSkillId, active: true } });
      const masteredCount = new Set(newMastered).size;
      const masteryPct = totalQuestions > 0 ? Math.round((masteredCount / totalQuestions) * 100) : 0;

      await prisma.skillProgress.upsert({
        where: { userId_microSkillId: { userId: user.id, microSkillId } },
        create: { userId: user.id, microSkillId, masteryPct, masteredCount, totalQuestions },
        update: { masteryPct, masteredCount, totalQuestions },
      });

      return NextResponse.json({
        correct,
        next: "NEXT_QUESTION",
        session: { id: updated.id, cycle: updated.cycle, pos: updated.pos, queueLen: queue.length, nextQueueLen: newNextQueue.length, masteryPct },
      });
    }

    // We just answered the last question in this cycle.
    if (newNextQueue.length === 0) {
      // MASTERED ✅
      await prisma.skillSession.update({
        where: { userId_microSkillId: { userId: user.id, microSkillId } },
        data: {
          status: "MASTERED",
          nextQueueJson: [],
          masteredJson: newMastered,
        },
      });

      const totalQuestions = await prisma.question.count({ where: { microSkillId, active: true } });
      const masteredCount = new Set(newMastered).size;
      const masteryPct = 100;

      await prisma.skillProgress.upsert({
        where: { userId_microSkillId: { userId: user.id, microSkillId } },
        create: { userId: user.id, microSkillId, masteryPct, masteredCount, totalQuestions },
        update: { masteryPct, masteredCount, totalQuestions },
      });

      return NextResponse.json({ correct, next: "MASTERED", masteryPct: 100 });
    }

    // Start next cycle with incorrects
    const newCycleQueue = newNextQueue;

    const updated = await prisma.skillSession.update({
      where: { userId_microSkillId: { userId: user.id, microSkillId } },
      data: {
        cycle: session.cycle + 1,
        queueJson: newCycleQueue,
        pos: 0,
        nextQueueJson: [],
        masteredJson: newMastered,
      },
    });

    const totalQuestions = await prisma.question.count({ where: { microSkillId, active: true } });
    const masteredCount = new Set(newMastered).size;
    const masteryPct = totalQuestions > 0 ? Math.round((masteredCount / totalQuestions) * 100) : 0;

    await prisma.skillProgress.upsert({
      where: { userId_microSkillId: { userId: user.id, microSkillId } },
      create: { userId: user.id, microSkillId, masteryPct, masteredCount, totalQuestions },
      update: { masteryPct, masteredCount, totalQuestions },
    });

    return NextResponse.json({
      correct,
      next: "NEXT_CYCLE",
      session: { id: updated.id, cycle: updated.cycle, queueLen: newCycleQueue.length, pos: updated.pos, masteryPct },
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    const status = err.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status });
  }
}
