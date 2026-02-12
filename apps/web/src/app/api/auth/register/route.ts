export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import argon2 from "argon2";
import { prisma } from "@/lib/db";
import { rateLimitOrThrow } from "@/lib/rateLimit";
import { buildSessionCookieValue, SESSION_COOKIE_NAME } from "@/lib/auth";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  name: z.string().min(1).max(80).optional(),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    await rateLimitOrThrow(`register:${ip}`, 10, 60);

    const body = Body.parse(await req.json());
    const email = body.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const passwordHash = await argon2.hash(body.password);

    const user = await prisma.user.create({
      data: { email, passwordHash, name: body.name },
      select: { id: true, email: true, name: true },
    });

    const res = NextResponse.json({ user }, { status: 201 });

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
