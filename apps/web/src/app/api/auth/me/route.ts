export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME, verifySessionCookie } from "@/lib/auth";

export async function GET() {
  const raw = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return NextResponse.json({ user: null });

  const session = verifySessionCookie(raw);
  if (!session) return NextResponse.json({ user: null });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json({ user: user ?? null });
}
