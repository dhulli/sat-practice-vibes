export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/serverAuth";

function normMcq(x: unknown): string {
  return String(x ?? "").trim().toUpperCase();
}

function normSpr(x: unknown): string {
  // keep numbers/symbols, trim spaces, collapse multiple spaces
  return String(x ?? "").trim().replace(/\s+/g, " ");
}

function isSprType(questionType: unknown): boolean {
  // Your enum has MATH_SPR. This keeps it robust.
  return String(questionType ?? "").toUpperCase().includes("SPR");
}

export async function POST(_req: Request, ctx: { params: Promise<{ attemptId: string }> }) {
  try {
    const user = await requireUser();
    const { attemptId } = await ctx.params;

    const attempt = await prisma.sectionAttempt.findFirst({
      where: { id: attemptId, userId: user.id },
      select: { id: true, status: true },
    });

    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    // Mark attempt submitted + ended timestamp
    await prisma.sectionAttempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        endedAt: new Date(),
      },
    });

    // Load answers with correct answers
    const answers = await prisma.sectionAttemptAnswer.findMany({
      where: { attemptId },
      select: {
        id: true,
        answer: true,
        questionId: true,
        questionRef: true,
        question: { select: { correctAnswer: true, questionType: true } },
      },
    });

    let correct = 0;

    for (const a of answers) {
      const correctAnswer = a.question?.correctAnswer ?? "";
      const spr = isSprType(a.question?.questionType);

      const ok = spr
        ? normSpr(a.answer) === normSpr(correctAnswer)
        : normMcq(a.answer) === normMcq(correctAnswer);

      if (ok) correct += 1;

      await prisma.sectionAttemptAnswer.update({
        where: { id: a.id },
        data: { isCorrect: ok },
      });
    }

    return NextResponse.json({
      ok: true,
      correct,
      answered: answers.length,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Internal Server Error";
    const status = msg.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}