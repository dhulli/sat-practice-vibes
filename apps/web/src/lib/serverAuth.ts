import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME, verifySessionCookie } from "@/lib/auth";

export async function requireUser() {
  const raw = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!raw) throw new Error("Unauthorized");

  const session = verifySessionCookie(raw);
  if (!session) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) throw new Error("Unauthorized");
  return user;
}
