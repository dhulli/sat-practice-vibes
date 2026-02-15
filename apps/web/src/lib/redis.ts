import Redis from "ioredis";

const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(url, {
    // Don’t hang requests forever if Redis is down
    maxRetriesPerRequest: 1,

    // Don’t connect at import time; connect when first used
    lazyConnect: true,

    enableReadyCheck: true,

    // Optional but helpful on Windows networks
    connectTimeout: 1500,
  });

// ✅ Prevent “Unhandled error event” crashes
redis.on("error", (err) => {
  console.error("[redis] error:", err?.message ?? err);
});

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
