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

    const analysis = await aiService.analyzeProgress(clientProfile, progress);
    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('Error generating analysis:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate analysis' },
      { status: 500 }
    );
  }
} 