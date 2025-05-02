import { NextRequest, NextResponse } from 'next/server';
import { Cache } from '@/lib/cache';

const cache = new Cache();

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
  // Skip caching for non-GET requests
  if (request.method !== 'GET') {
    const response = NextResponse.next();
    response.headers.set('X-Cache', 'BYPASS');
    return response;
  }

  // Skip caching if cache-control header is set to no-cache
  const cacheControl = request.headers.get('cache-control');
  if (cacheControl?.includes('no-cache')) {
    const response = NextResponse.next();
    response.headers.set('X-Cache', 'BYPASS');
    return response;
  }

  // Skip caching for non-JSON responses
  const contentType = request.headers.get('content-type');
  if (contentType && !contentType.includes('application/json')) {
    const response = NextResponse.next();
    response.headers.set('X-Cache', 'BYPASS');
    return response;
  }

  const pathname = request.nextUrl.pathname;
  
  // Check if route should be cached
  if (!CACHEABLE_ROUTES.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next();
    response.headers.set('X-Cache', 'BYPASS');
    return response;
  }

  try {
    const cacheKey = request.url;
    const cachedResponse = await cache.get(cacheKey);

    if (cachedResponse) {
      const response = NextResponse.json(cachedResponse);
      response.headers.set('X-Cache', 'HIT');
      return response;
    }

    // Get TTL from config or use default
    const routeConfig = CACHEABLE_ROUTES.find(route => pathname.startsWith(route));
    const ttl = routeConfig ? CACHE_CONFIG[routeConfig].ttl : 3600;

    // Get the original response
    const response = await NextResponse.next();
    
    try {
      // Clone and cache the response
      const clonedResponse = response.clone();
      const responseData = await clonedResponse.json();
      await cache.set(cacheKey, responseData, ttl);
      response.headers.set('X-Cache', 'MISS');
    } catch (error) {
      console.error('Error caching response:', error);
      response.headers.set('X-Cache', 'BYPASS');
    }

    return response;
  } catch (error) {
    console.error('Cache middleware error:', error);
    const response = NextResponse.next();
    response.headers.set('X-Cache', 'BYPASS');
    return response;
  }
} 