import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { performanceMonitor } from '@/lib/services/performanceMonitor';

export async function performanceMiddleware(
  request: NextRequest,
  next: () => Promise<NextResponse>
) {
  const startTime = performance.now();
  const url = new URL(request.url);
  const endpoint = url.pathname;

  try {
    // Continue to the next middleware or route handler
    const response = await next();

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Track response time
    performanceMonitor.trackResponseTime(endpoint, duration, {
      method: request.method,
      status: response.status,
      contentType: response.headers.get('content-type'),
    });

    return response;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Track response time even for errors
    performanceMonitor.trackResponseTime(endpoint, duration, {
      method: request.method,
      status: 500,
      error: error.message
    });

    throw error;
  }
} 