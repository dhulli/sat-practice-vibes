export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/serverAuth";

export async function POST(_req: Request, ctx: { params: Promise<{ attemptId: string }> }) {
  try {
    const user = await requireUser();
    const { attemptId } = await ctx.params;

    await prisma.sectionAttempt.updateMany({
      where: { id: attemptId, userId: user.id },
      data: { status: "SUBMITTED", endedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { message?: string };
    const status = err.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status });
  }
}
