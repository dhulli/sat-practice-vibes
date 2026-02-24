export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/serverAuth";

const Body = z.object({
  sectionId: z.string().min(1),
  sectionType: z.enum(["RW", "MATH"]),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = Body.parse(await req.json());

    const last = await prisma.sectionAttempt.findFirst({
      where: { userId: user.id, sectionId: body.sectionId },
      orderBy: { attemptNo: "desc" },
      select: { attemptNo: true },
    });

    const created = await prisma.sectionAttempt.create({
      data: {
        userId: user.id,
        sectionId: body.sectionId,
        sectionType: body.sectionType,
        attemptNo: (last?.attemptNo ?? 0) + 1,
        status: "IN_PROGRESS",
      },
      select: { id: true, startedAt: true },
    });

    return NextResponse.json({ attemptId: created.id, startedAt: created.startedAt.toISOString() });
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Invalid start payload", issues: e.issues }, { status: 422 });
    }

    const err = e as { message?: string };
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err.message ?? "Internal Server Error" }, { status });
  }
}
