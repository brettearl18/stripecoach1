import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error('Missing UPSTASH_REDIS_REST_URL environment variable');
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing UPSTASH_REDIS_REST_TOKEN environment variable');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Helper functions for type-safe caching
export async function cache<T>(
  key: string,
  getData: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const data = await getData();
  await redis.setex(key, ttl, data);
  return data;
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
} 