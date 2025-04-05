import { NextResponse } from 'next/server';
import { AIService } from '@/lib/services/aiService';
import { CheckInForm } from '@/types/checkIn';

// Cache storage
let insightsCache = {
  data: null,
  timestamp: 0,
  checkInId: null
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { checkIns, analysisType } = body;

    if (!Array.isArray(checkIns) || checkIns.length === 0) {
      return NextResponse.json({ error: 'Invalid check-ins data' }, { status: 400 });
    }

    // Get the latest check-in
    const latestCheckIn = checkIns[0];

    // Check cache validity
    const now = Date.now();
    if (
      insightsCache.data &&
      insightsCache.checkInId === latestCheckIn.id &&
      now - insightsCache.timestamp < CACHE_DURATION
    ) {
      return NextResponse.json({ insights: insightsCache.data });
    }

    // Initialize AI service
    const aiService = new AIService();
    let insights;

    try {
      if (analysisType === 'individual') {
        insights = await aiService.analyzeCheckIn(latestCheckIn);
      } else {
        insights = await aiService.generateGroupInsights([latestCheckIn]);
      }

      // Update cache
      insightsCache = {
        data: insights,
        timestamp: now,
        checkInId: latestCheckIn.id
      };

      return NextResponse.json({ insights });
    } catch (error) {
      console.error('Error in AI analysis:', error);
      
      // Return cached data if available
      if (insightsCache.data) {
        return NextResponse.json({ 
          insights: insightsCache.data,
          warning: 'Using cached data due to analysis error'
        });
      }
      
      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error in AI insights route:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
} 