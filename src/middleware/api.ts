import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAPIKey, getRateLimit, updateAPIKey } from '@/lib/services/apiService';
import { APICredentials } from '@/types/api';

export async function validateAPIKey(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is required' },
      { status: 401 }
    );
  }

  const key = await getAPIKey(apiKey);
  if (!key) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }

  if (key.status !== 'active') {
    return NextResponse.json(
      { error: 'API key is not active' },
      { status: 403 }
    );
  }

  // Check rate limits
  const rateLimit = await getRateLimit(key.coachId, key.id);
  if (!rateLimit) {
    return NextResponse.json(
      { error: 'Rate limit configuration not found' },
      { status: 500 }
    );
  }

  const now = new Date();
  const minuteAgo = new Date(now.getTime() - 60000);
  const hourAgo = new Date(now.getTime() - 3600000);
  const dayAgo = new Date(now.getTime() - 86400000);

  // Reset counters if needed
  if (now.getTime() - rateLimit.lastReset.minute.getTime() > 60000) {
    rateLimit.currentUsage.minute = 0;
    rateLimit.lastReset.minute = now;
  }
  if (now.getTime() - rateLimit.lastReset.hour.getTime() > 3600000) {
    rateLimit.currentUsage.hour = 0;
    rateLimit.lastReset.hour = now;
  }
  if (now.getTime() - rateLimit.lastReset.day.getTime() > 86400000) {
    rateLimit.currentUsage.day = 0;
    rateLimit.lastReset.day = now;
  }

  // Check if limits are exceeded
  if (rateLimit.currentUsage.minute >= key.rateLimit.requestsPerMinute) {
    return NextResponse.json(
      { error: 'Rate limit exceeded (per minute)' },
      { status: 429 }
    );
  }
  if (rateLimit.currentUsage.hour >= key.rateLimit.requestsPerHour) {
    return NextResponse.json(
      { error: 'Rate limit exceeded (per hour)' },
      { status: 429 }
    );
  }
  if (rateLimit.currentUsage.day >= key.rateLimit.requestsPerDay) {
    return NextResponse.json(
      { error: 'Rate limit exceeded (per day)' },
      { status: 429 }
    );
  }

  // Increment usage counters
  rateLimit.currentUsage.minute++;
  rateLimit.currentUsage.hour++;
  rateLimit.currentUsage.day++;

  // Update rate limit tracking
  await updateAPIKey(key.id, {
    lastUsed: now,
  });

  // Add coach ID to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-coach-id', key.coachId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export async function validatePermissions(
  request: NextRequest,
  requiredPermissions: (keyof APICredentials['permissions'])[]
) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is required' },
      { status: 401 }
    );
  }

  const key = await getAPIKey(apiKey);
  if (!key) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }

  // Check if all required permissions are granted
  const hasAllPermissions = requiredPermissions.every(
    permission => key.permissions[permission]
  );

  if (!hasAllPermissions) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return NextResponse.next();
} 