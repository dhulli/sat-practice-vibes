"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";

const navItems = [
  { href: "/section-practice", label: "Section Practice" },
  { href: "/micro-skill-practice", label: "Micro-skill Practice" },
  { href: "/review", label: "Review" },
  { href: "/account", label: "Account" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Button
            key={item.href}
            asChild
            variant={active ? "secondary" : "ghost"}
            className="justify-start"
            onClick={onNavigate}
          >
            <Link href={item.href}>{item.label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  userLabel,
}: {
  children: ReactNode;
  userLabel: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex items-center justify-between">
                  <Link href="/" className="font-semibold">
                    sat-practice-vibes
                  </Link>
                  <Badge variant="secondary">MVP</Badge>
                </div>
                <Separator className="my-4" />
                <NavLinks />
              </SheetContent>
            </Sheet>

            <Link href="/" className="font-semibold tracking-tight">
              sat-practice-vibes
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              MVP
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground">{userLabel}</div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden md:block">
          <div className="rounded-xl border p-3 sticky top-20">
            <div className="text-xs text-muted-foreground mb-2">Navigation</div>
            <NavLinks />
          </div>
        </aside>

        <main className="space-y-4">{children}</main>
      </div>
    </div>
  );
}
