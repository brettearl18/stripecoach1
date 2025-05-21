import { NextResponse } from 'next/server';
import { AIService, AIError } from '@/lib/services/aiService';
import { CheckInForm } from '@/types/checkIn';
import { redis } from '@/lib/redis';
// Sentry integration
import * as Sentry from '@sentry/nextjs';

// Initialize Sentry (handled by sentry.server.config.js, but safe to call here)
Sentry.init({ dsn: process.env.SENTRY_DSN });

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 5 * 60;

// Error response helper
function createErrorResponse(error: AIError, status: number = 500) {
  return NextResponse.json({
    error: error.message,
    type: error.type,
    retryable: error.retryable,
    timestamp: new Date().toISOString()
  }, { status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { checkIns, analysisType, testError } = body;

    // Test error trigger for Sentry verification
    if (testError) {
      throw new Error('Sentry test error: This is a test error for Sentry integration.');
    }

    if (!Array.isArray(checkIns) || checkIns.length === 0) {
      return createErrorResponse(
        new AIError('Invalid check-ins data', 'VALIDATION', false),
        400
      );
    }

    // Get the latest check-in
    const latestCheckIn = checkIns[0];
    const cacheKey = `ai:insights:${latestCheckIn.id}`;

    // Try to get cached insights from Redis
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        insights: cached,
        cached: true,
        timestamp: Date.now()
      });
    }

    // Initialize AI service
    const aiService = new AIService(process.env.OPENAI_API_KEY || '');
    let insights;

    try {
      if (analysisType === 'individual') {
        insights = await aiService.analyzeCheckIn(latestCheckIn);
      } else {
        insights = await aiService.generateGroupInsights([latestCheckIn]);
      }

      // Store insights in Redis cache
      await redis.setex(cacheKey, CACHE_DURATION, insights);

      return NextResponse.json({
        insights,
        cached: false,
        timestamp: Date.now()
      });
    } catch (error) {
      Sentry.captureException(error);
      if (error instanceof AIError) {
        // Handle specific AI errors
        if (error.type === 'RATE_LIMIT') {
          return createErrorResponse(error, 429);
        }
        if (error.type === 'VALIDATION') {
          return createErrorResponse(error, 400);
        }
        if (error.type === 'NETWORK') {
          return createErrorResponse(error, 503);
        }
      }

      // On error, try to return cached data if available
      const fallback = await redis.get(cacheKey);
      if (fallback) {
        return NextResponse.json({
          insights: fallback,
          cached: true,
          warning: 'Using cached data due to analysis error',
          timestamp: Date.now()
        });
      }

      // If no cache available, return error
      return createErrorResponse(
        new AIError('Failed to generate insights', 'API', true),
        500
      );
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error in AI insights route:', error);
    return createErrorResponse(
      new AIError('Internal server error', 'API', false),
      500
    );
  }
} 