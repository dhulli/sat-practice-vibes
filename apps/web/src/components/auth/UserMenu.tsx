"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Me = { user: { id: string; email: string; name: string | null } | null };

export function UserMenu() {
  const [me, setMe] = useState<Me["user"]>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j: Me) => setMe(j.user))
      .catch(() => setMe(null));
  }, []);

  if (!me) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-muted-foreground">
        {me.name ? me.name : me.email}
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/login";
        }}
      >
        Logout
      </Button>
    </div>
  );
}
