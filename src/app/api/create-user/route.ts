import { NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: Request) {
  try {
    const { uid, email, role } = await request.json();

    if (!uid || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create user document in Firestore
    await setDoc(doc(db, role === 'coach' ? 'coaches' : 'clients', uid), {
      email,
      role,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 