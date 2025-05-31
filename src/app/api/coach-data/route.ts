import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const coachId = searchParams.get('coachId');
  if (!coachId) return NextResponse.json({ error: 'Missing coachId' }, { status: 400 });

  const db = getAdminFirestore();
  const coachRef = db.collection('coaches').doc(coachId);
  const coachSnap = await coachRef.get();
  if (!coachSnap.exists) return NextResponse.json({ error: 'Coach not found' }, { status: 404 });

  const coach = coachSnap.data();
  return NextResponse.json({
    aiInsights: coach.aiInsights ?? '',
    aiRefreshCredits: coach.aiRefreshCredits ?? 3,
  });
} 