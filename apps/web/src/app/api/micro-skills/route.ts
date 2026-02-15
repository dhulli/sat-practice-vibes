export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/serverAuth";

export async function GET() {
  try {
    const user = await requireUser();

    const skills = await prisma.microSkill.findMany({
      where: { active: true },
      orderBy: [{ section: { code: "asc" } }, { order: "asc" }],
      include: {
        category: { select: { name: true } },
        section: { select: { code: true, name: true } },
      },
    });

    const counts = await prisma.question.groupBy({
    by: ["microSkillId"],
    where: { active: true },
    _count: { _all: true },
    });
    const countMap = new Map(counts.map((c) => [c.microSkillId, c._count._all]));


    const progress = await prisma.skillProgress.findMany({
      where: { userId: user.id },
      select: { microSkillId: true, masteryPct: true, masteredCount: true, totalQuestions: true },
    });

    const map = new Map(progress.map((p) => [p.microSkillId, p]));

    const result = skills.map((s) => {
      const p = map.get(s.id);
      return {
        id: s.id,
        code: s.code,
        name: s.name,
        section: s.section.code,
        category: s.category.name,
        masteryPct: p?.masteryPct ?? 0,
        masteredCount: p?.masteredCount ?? 0,
        totalQuestions: countMap.get(s.id) ?? 0,
      };
    });

    return NextResponse.json({ skills: result });
  } catch (e: unknown) {
    const err = e as { message?: string };
    const status = err.message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status });
  }
}
