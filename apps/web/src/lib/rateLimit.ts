import { redis } from "@/lib/redis";

export async function rateLimitOrThrow(key: string, limit: number, windowSeconds: number) {
  const nowKey = `rl:${key}`;
  const count = await redis.incr(nowKey);
  if (count === 1) {
    await redis.expire(nowKey, windowSeconds);
  }
  if (count > limit) {
    const ttl = await redis.ttl(nowKey);
    const err = new Error(`Rate limited. Try again in ${ttl}s.`);
    // @ts-expect-error custom
    err.status = 429;
    throw err;
  }
}
