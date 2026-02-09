import { SectionCard } from "@/components/sections/SectionCard";
import { buildSections } from "@/lib/sections";

export default function RWSectionsPage() {
  const sections = buildSections("RW", 30);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">RW Sections</h1>
          <p className="text-sm text-muted-foreground">
            Timed practice • 27 questions • 4 categories • 30 sections
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <SectionCard key={s.id} section={s} />
        ))}
      </div>
    </div>
  );
}
