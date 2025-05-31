import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { getAdminFirestore } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { coachId, prompt } = await req.json();
  if (!coachId) return NextResponse.json({ error: 'Missing coachId' }, { status: 400 });

  const db = getAdminFirestore();
  const coachRef = db.collection('coaches').doc(coachId);
  const coachSnap = await coachRef.get();

  if (!coachSnap.exists) {
    return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
  }

  const coach = coachSnap.data();
  const credits = coach.aiRefreshCredits ?? 3;

  if (credits <= 0) {
    return NextResponse.json({ error: 'No refresh credits left this week.' }, { status: 403 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    });

    const summary = completion.choices[0].message.content;

    await coachRef.update({
      aiInsights: summary,
      aiRefreshCredits: credits - 1,
      lastAIRefresh: Timestamp.now(),
    });

    return NextResponse.json({ result: summary, credits: credits - 1 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 