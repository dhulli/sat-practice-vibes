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

function getClientIp(req: Request) {
  // In prod behind a proxy, this is typically a comma-separated list.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  // Next dev often won’t set xff
  return req.headers.get("x-real-ip")?.trim() || "local";
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    const json = await req.json();
    const body = Body.parse(json);

    const email = body.email.toLowerCase().trim();

    // ✅ Rate limit: IP + email (fail-open if Redis is down)
    await rateLimitOrThrow(`login:ip:${ip}`, 20, 60, { failOpen: true });       // 20/min per IP
    await rateLimitOrThrow(`login:email:${email}`, 10, 60, { failOpen: true }); // 10/min per email

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true, name: true },
    });

    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const ok = await argon2.verify(user.passwordHash, body.password);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });

    res.cookies.set(
      SESSION_COOKIE_NAME,
      buildSessionCookieValue({ userId: user.id, email: user.email }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      }
    );

    return res;
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const status = err.status ?? 400;
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status });
  }
}
