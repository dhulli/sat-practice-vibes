import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SectionPracticePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Section Practice</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Reading & Writing (RW)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Timed sections • 27 questions • 4 categories • results + review.
            </p>
            <Button asChild>
              <Link href="/section-practice/rw">Browse RW Sections</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Math</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Timed sections • 22 questions • 4 categories • results + review.
            </p>
            <Button asChild>
              <Link href="/section-practice/math">Browse Math Sections</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
