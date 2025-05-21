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

    const { profile, timestamp } = await req.json();

    // Save profile data to Firestore
    await setDoc(doc(db, 'profiles', session.user.email), {
      ...profile,
      email: session.user.email,
      updatedAt: timestamp,
      createdAt: timestamp
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
} 