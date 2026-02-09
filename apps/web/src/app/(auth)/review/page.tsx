import { Card, CardContent } from "@/components/ui/card";

export default function ReviewPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Review</h1>
      <Card className="rounded-2xl">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Attempt history will be implemented in Chunk 4.
        </CardContent>
      </Card>
    </div>
  );
}
