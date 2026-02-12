import { AppShell } from "@/components/app/AppShell";
import { UserMenu } from "@/components/auth/UserMenu";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      rightSlot={<UserMenu />}
    >
      {children}
    </AppShell>
  );
}
