import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            sat-practice-vibes
          </h1>
          <p className="text-muted-foreground">
            Timed section practice and untimed micro-skill drills — built for real SAT confidence.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Section Practice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                30 RW sections and 30 Math sections. Timed. Review results by category.
              </p>
              <Button asChild className="w-full">
                <Link href="/section-practice">Enter App</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Micro-skill Practice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                50 RW micro-skills and 36 Math micro-skills. Untimed. Check + explanation.
              </p>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/micro-skill-practice">Start Drills</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <Link className="underline" href="/login">Sign in</Link>{" "}
          •{" "}
          <Link className="underline" href="/signup">Create account</Link>
        </div>
      </div>
    </div>
  );
}
