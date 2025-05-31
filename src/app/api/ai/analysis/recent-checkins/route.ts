import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiService } from '@/lib/services/aiService';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get date range from query params
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const checkIns = await aiService.getRecentCheckIns(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return NextResponse.json(checkIns);
  } catch (error: any) {
    console.error('Error fetching recent check-ins:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recent check-ins' },
      { status: 500 }
    );
  }
} 