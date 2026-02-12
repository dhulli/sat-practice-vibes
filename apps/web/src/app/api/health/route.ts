export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";

export async function GET() {
  const started = Date.now();

  await prisma.$queryRaw`SELECT 1`;
  const pong = await redis.ping();
  if (pong !== "PONG") throw new Error("Redis ping failed");

  return NextResponse.json({
    ok: true,
    db: "ok",
    redis: "ok",
    ms: Date.now() - started,
  });
}
