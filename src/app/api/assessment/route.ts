import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase/firebase-client';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { assessment, timestamp } = await req.json();

    // Save assessment data to Firestore
    await setDoc(doc(db, 'assessments', session.user.email), {
      ...assessment,
      email: session.user.email,
      updatedAt: timestamp,
      createdAt: timestamp
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving assessment:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    );
  }
} 