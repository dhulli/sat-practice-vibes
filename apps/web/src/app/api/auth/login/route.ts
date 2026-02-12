export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import argon2 from "argon2";
import { prisma } from "@/lib/db";
import { rateLimitOrThrow } from "@/lib/rateLimit";
import { buildSessionCookieValue, SESSION_COOKIE_NAME } from "@/lib/auth";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(72),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    await rateLimitOrThrow(`login:${ip}`, 20, 60); // 20/min

    const json = await req.json();
    const body = Body.parse(json);

    const email = body.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true, name: true },
    });

    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const ok = await argon2.verify(user.passwordHash, body.password);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });

    res.cookies.set(SESSION_COOKIE_NAME, buildSessionCookieValue({ userId: user.id, email: user.email }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    });

    return res;

  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const status = err.status ?? 400;
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status });
  }
}
