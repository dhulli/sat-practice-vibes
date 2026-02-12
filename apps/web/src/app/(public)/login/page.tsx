"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/micro-skill-practice";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Login failed");
      router.push(next);
    } catch (e: unknown) {
      setErr((e as Error)?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center p-6">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="space-y-2">
              <div className="text-sm font-medium">Email</div>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Password</div>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </div>

            {err ? <div className="text-sm text-red-500">{err}</div> : null}

            <Button className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="text-sm text-muted-foreground">
            New here?{" "}
            <Link className="underline" href={`/register?next=${encodeURIComponent(next)}`}>
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
