import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiService } from '@/lib/services/aiService';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientProfile, progress } = await req.json();
    if (!clientProfile || !progress) {
      return NextResponse.json(
        { error: 'Client profile and progress data are required' },
        { status: 400 }
      );
    }

    const feedback = await aiService.generateFeedback(clientProfile, progress);
    return NextResponse.json({ feedback });
  } catch (error: any) {
    console.error('Error generating feedback:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate feedback' },
      { status: 500 }
    );
  }
} 