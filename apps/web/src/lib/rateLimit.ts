import { redis } from "@/lib/redis";

type RateLimitOptions = {
  failOpen?: boolean; // if Redis fails, allow request (recommended)
};

export async function rateLimitOrThrow(
  key: string,
  limit: number,
  windowSeconds: number,
  opts: RateLimitOptions = { failOpen: true }
) {
  const nowKey = `rl:${key}`;

  try {
    // If redis client is lazyConnect, connect on first use.
    if (redis.status === "wait") {
      await redis.connect();
    }

    // Atomic-ish pattern: INCR then set EXPIRE only on first hit
    const multi = redis.multi();
    multi.incr(nowKey);
    multi.ttl(nowKey);
    const res = await multi.exec();

    // res is [[err,val],[err,val]]
    const incrVal = res?.[0]?.[1];
    const ttlVal = res?.[1]?.[1];

    const count = typeof incrVal === "number" ? incrVal : Number(incrVal);

    // If first time, ttl could be -1 (no expire) or -2 (missing) depending on timing.
    if (count === 1 || ttlVal === -1) {
      await redis.expire(nowKey, windowSeconds);
    }

    if (count > limit) {
      const ttl = await redis.ttl(nowKey);
      const err = new Error(`Rate limited. Try again in ${Math.max(ttl, 1)}s.`);
      // @ts-expect-error custom
      err.status = 429;
      throw err;
    }
  } catch (e) {
    // If Redis is down, DO NOT break login / core flows
    if (opts.failOpen) return;

    // fail-closed mode (rare) — rethrow
    throw e;
  }
}
