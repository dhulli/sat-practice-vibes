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

    // nothing special yet; session state is already persisted per answer.
    // This exists so UI can explicitly "Exit" and we can add audit later.
    const session = await prisma.skillSession.findUnique({
      where: { userId_microSkillId: { userId: user.id, microSkillId } },
    });

    return NextResponse.json({ ok: true, session: session ? { id: session.id, status: session.status } : null });
  } catch (e: unknown) {
    const err = e as { message?: string };
    const status = err.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status });
  }
}
