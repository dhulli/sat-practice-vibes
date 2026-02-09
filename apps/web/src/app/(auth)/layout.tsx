import { redirect } from "next/navigation";
import { getMockSession } from "@/lib/auth";
import { AppShell } from "@/components/app/AppShell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = getMockSession();
  if (!session) redirect("/login");

  return (
    <AppShell userLabel={`${session.user.name} (mock)`}>
      {children}
    </AppShell>
  );
}
