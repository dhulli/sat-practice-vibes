export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/serverAuth";

export async function GET(_req: Request, ctx: { params: Promise<{ attemptId: string }> }) {
  try {
    const user = await requireUser();
    const { attemptId } = await ctx.params;

    const attempt = await prisma.sectionAttempt.findFirst({
      where: { id: attemptId, userId: user.id },
      select: {
        id: true,
        sectionId: true,
        sectionType: true,
        status: true,
        startedAt: true,
        endedAt: true, // ✅ use endedAt (exists in your schema)
        remainingSeconds: true,
        currentIndex: true,
        selectedJson: true,
        reviewJson: true,
      },
    });

    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    const answers = await prisma.sectionAttemptAnswer.findMany({
        where: { attemptId },
        orderBy: { id: "asc" },
        select: {
            questionId: true,
            questionRef: true,
            answer: true,
            isCorrect: true,
            question: {
            select: {
                id: true,
                questionType: true,
                correctAnswer: true,
                passageHtml: true,
                questionHtml: true,
                choicesJson: true,
            },
            },
        },
        });

    const correct = answers.filter((a) => a.isCorrect === true).length;

    return NextResponse.json({
      attempt,
      totals: {
        answered: answers.length,
        correct,
      },
      answers: answers.map((a) => ({
        questionId: a.questionId,
        answer: a.answer,
        isCorrect: a.isCorrect,
        correctAnswer: a.question?.correctAnswer ?? null,
        questionType: a.question?.questionType ?? null,
        passageHtml: a.question?.passageHtml ?? null,
        questionHtml: a.question?.questionHtml ?? null,
        choices: (a.question?.choicesJson ?? []) as Array<{ id: string; textHtml: string }>,
      })),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Internal Server Error";
    const status = msg.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}