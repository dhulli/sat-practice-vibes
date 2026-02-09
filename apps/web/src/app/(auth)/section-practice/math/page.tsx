import { Card, CardContent } from "@/components/ui/card";

export default function MathSectionsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Math Sections</h1>
      <Card className="rounded-2xl">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Math Section list UI comes next (Chunk 2): Math Section 01–30 with Start/Resume/Review.
        </CardContent>
      </Card>
    </div>
  );
}
