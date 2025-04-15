import { Redis } from '@upstash/redis';
import { env } from '@/env.mjs';

// Initialize Redis client
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

interface CacheConfig {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

const DEFAULT_TTL = 3600; // 1 hour default cache time

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function cacheSet(key: string, data: any, config: CacheConfig = {}): Promise<void> {
  const { ttl = DEFAULT_TTL, prefix = '' } = config;
  const fullKey = prefix ? `${prefix}:${key}` : key;
  
  try {
    await redis.set(fullKey, data, { ex: ttl });
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function cacheDelete(key: string, prefix?: string): Promise<void> {
  const fullKey = prefix ? `${prefix}:${key}` : key;
  try {
    await redis.del(fullKey);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  config: CacheConfig = {}
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached) {
    return cached;
  }

  const data = await fetchFn();
  await cacheSet(key, data, config);
  return data;
}

// Cache invalidation helpers
export const invalidateCache = {
  // Invalidate all client-related cache for a coach
  async coachClients(coachId: string): Promise<void> {
    const pattern = `coach:${coachId}:clients:*`;
    await invalidatePattern(pattern);
  },

  // Invalidate specific client cache
  async client(clientId: string): Promise<void> {
    const pattern = `client:${clientId}:*`;
    await invalidatePattern(pattern);
  },

  // Invalidate template cache
  async template(templateId: string): Promise<void> {
    const pattern = `template:${templateId}:*`;
    await invalidatePattern(pattern);
  },
};

async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
} 