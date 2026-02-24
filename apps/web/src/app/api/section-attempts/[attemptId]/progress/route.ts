export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/serverAuth";

const Body = z.object({
  currentIndex: z.number().int().min(0),
  remainingSeconds: z.number().int().min(0),
  selected: z.record(z.string()),
  review: z.record(z.boolean()),
  questionRefs: z.record(z.string()).optional().default({}),
});

export async function POST(req: Request, ctx: { params: Promise<{ attemptId: string }> }) {
  try {
    const user = await requireUser();
    const { attemptId } = await ctx.params;
    const body = Body.parse(await req.json());

    const updated = await prisma.sectionAttempt.updateMany({
      where: { id: attemptId, userId: user.id },
      data: {
        currentIndex: body.currentIndex,
        remainingSeconds: body.remainingSeconds,
        selectedJson: body.selected,
        reviewJson: body.review,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const answerOps = Object.entries(body.selected)
      .filter(([, answer]) => String(answer).trim() !== "")
      .map(([idx, answer]) => {
        const questionRef = body.questionRefs[idx] ?? `Q-${idx}`;
        return prisma.sectionAttemptAnswer.upsert({
          where: {
            attemptId_questionRef: {
              attemptId,
              questionRef,
            },
          },
          create: {
            attemptId,
            questionRef,
            answer: String(answer),
          },
          update: {
            answer: String(answer),
            answeredAt: new Date(),
          },
        });
      });

    if (answerOps.length > 0) {
      try {
        await prisma.$transaction(answerOps);
      } catch (err) {
        // Keep attempt progress durable even if answer-row schema is behind on a developer machine.
        console.error("[section-attempts/progress] answer upsert skipped", err);
        return NextResponse.json({ ok: true, answersPersisted: false });
      }
    }

    return NextResponse.json({ ok: true, answersPersisted: true });
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Invalid progress payload", issues: e.issues }, { status: 422 });
    }

    const err = e as { message?: string };
    const status = err.message === "Unauthorized" ? 401 : 500;
    const error = err.message ?? "Internal Server Error";
    return NextResponse.json({ error }, { status });
  }
}
