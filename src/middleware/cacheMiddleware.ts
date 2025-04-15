import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cacheGet, cacheSet } from '@/lib/cache';

// Routes that should be cached
const CACHEABLE_ROUTES = [
  '/api/coach/clients',
  '/api/coach/templates',
  '/api/check-ins',
];

// Cache configuration by route
const CACHE_CONFIG = {
  '/api/coach/clients': { ttl: 300 },    // 5 minutes
  '/api/coach/templates': { ttl: 3600 }, // 1 hour
  '/api/check-ins': { ttl: 300 },       // 5 minutes
};

export async function cacheMiddleware(request: NextRequest) {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  
  // Check if route should be cached
  if (!CACHEABLE_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Generate cache key based on full URL (including query params)
  const cacheKey = request.url;

  try {
    // Try to get from cache
    const cachedResponse = await cacheGet(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
        },
      });
    }

    // If not in cache, proceed with request
    const response = await NextResponse.next();
    const data = await response.json();

    // Cache the response
    const config = CACHE_CONFIG[pathname as keyof typeof CACHE_CONFIG] || { ttl: 300 };
    await cacheSet(cacheKey, data, config);

    return NextResponse.json(data, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Cache middleware error:', error);
    return NextResponse.next();
  }
} 