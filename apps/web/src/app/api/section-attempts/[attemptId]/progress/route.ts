export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/serverAuth";

const Body = z.object({
  currentIndex: z.number().int().min(0),
  remainingSeconds: z.number().int().min(0),
  selected: z.record(z.string()),
  review: z.record(z.boolean()),
});

export async function POST(req: Request, ctx: { params: Promise<{ attemptId: string }> }) {
  try {
    const user = await requireUser();
    const { attemptId } = await ctx.params;
    const body = Body.parse(await req.json());

    await prisma.sectionAttempt.updateMany({
      where: { id: attemptId, userId: user.id },
      data: {
        currentIndex: body.currentIndex,
        remainingSeconds: body.remainingSeconds,
        selectedJson: body.selected,
        reviewJson: body.review,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { message?: string };
    const status = err.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status });
  }
}
