import { NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase/firebase-client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // Direct Firebase Auth sign-in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if user exists in Firestore and has the 'coach' role
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    if (userData.role !== 'coach') {
      return NextResponse.json({ error: 'Not authorized as a coach' }, { status: 403 });
    }

    // Return the user data
    return NextResponse.json({
      id: user.uid,
      email: user.email,
      name: userData.name,
      role: userData.role
    });
  } catch (error) {
    console.error('Coach login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
} 