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
        currentIndex: true,
        remainingSeconds: true,
        selectedJson: true,
        reviewJson: true,
        practiceSectionId: true,
        practiceSection: {
          select: { id: true, code: true, name: true, durationSec: true, type: true },
        },
      },
    });

    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    // If practiceSectionId wasn't stored (older attempts), fallback by code == sectionId
    const practiceSection =
      attempt.practiceSection ??
      (await prisma.practiceSection.findUnique({
        where: { code: attempt.sectionId },
        select: { id: true, code: true, name: true, durationSec: true, type: true },
      }));

    if (!practiceSection) {
      return NextResponse.json(
        { error: "Practice section not found for this attempt", sectionId: attempt.sectionId },
        { status: 404 }
      );
    }

    const rows = await prisma.practiceSectionQuestion.findMany({
      where: { practiceSectionId: practiceSection.id },
      orderBy: { sequenceNo: "asc" },
      select: {
        sequenceNo: true,
        question: {
          select: {
            id: true,
            questionType: true,
            passageHtml: true,
            questionHtml: true,
            choicesJson: true,
            assetUrl: true,
          },
        },
      },
    });

    const questions = rows.map((r) => ({
      sequenceNo: r.sequenceNo,
      ...r.question,
      choices: (r.question.choicesJson ?? []) as Array<{ id: string; textHtml: string }>,
    }));

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        status: attempt.status,
        sectionType: attempt.sectionType,
        currentIndex: attempt.currentIndex,
        remainingSeconds: attempt.remainingSeconds,
        selected: attempt.selectedJson,
        review: attempt.reviewJson,
      },
      practiceSection,
      questions,
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err.message ?? "Internal Server Error" }, { status });
  }
}