import { Card, CardContent } from "@/components/ui/card";

export default function AccountPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
      <Card className="rounded-2xl">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Account settings will be added later. This validates navigation and gating.
        </CardContent>
      </Card>
    </div>
  );
}
