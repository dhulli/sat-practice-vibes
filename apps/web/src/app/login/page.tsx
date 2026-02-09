import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Mock login for now. Backend auth will be added later.
          </p>
          <Button asChild className="w-full">
            <Link href="/section-practice">Continue</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            No account? <Link className="underline" href="/signup">Create one</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
