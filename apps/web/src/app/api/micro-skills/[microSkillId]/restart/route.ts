export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/serverAuth";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ microSkillId: string }> }
) {
  try {
    const user = await requireUser();
    const { microSkillId } = await ctx.params;

    // ensure skill exists
    const skill = await prisma.microSkill.findUnique({
      where: { id: microSkillId },
      select: { id: true },
    });
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // wipe session + progress (hard reset)
    await prisma.$transaction([
      prisma.skillSession.deleteMany({
        where: { userId: user.id, microSkillId },
      }),
      prisma.skillProgress.deleteMany({
        where: { userId: user.id, microSkillId },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e as { message?: string; status?: number };
    const status = err.status ?? (err.message === "Unauthorized" ? 401 : 400);
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status });
  }
}
