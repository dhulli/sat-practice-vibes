import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/serverAuth";
import { SectionCard } from "@/components/sections/SectionCard";

export default async function RWSectionsPage() {
  await requireUser();

  const sections = await prisma.practiceSection.findMany({
    where: { type: "RW", active: true },
    orderBy: { code: "asc" },
    select: {
      code: true,
      name: true,
      durationSec: true,
      type: true,
      _count: { select: { questions: true } },
    },
  });

  const defs = sections.map((s, idx) => ({
    id: s.code, // IMPORTANT: now matches DB code
    type: s.type,
    number: idx + 1,
    title: s.name,
    totalQuestions: s._count.questions,
    timeLimitSeconds: s.durationSec,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">RW Sections</h1>
          <p className="text-sm text-muted-foreground">
            Timed practice • DB-backed sections • results + review
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {defs.map((s) => (
          <SectionCard key={s.id} section={s} />
        ))}
      </div>
    </div>
  );
}