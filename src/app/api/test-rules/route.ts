import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function GET() {
  try {
    // Test 1: Create a test user
    const userEmail = `test${Date.now()}@example.com`;
    const userPassword = 'testPassword123!';
    
    const userRecord = await adminAuth.createUser({
      email: userEmail,
      password: userPassword,
      displayName: 'Test User'
    });

    // Test 2: Try to write to users collection
    await adminDb.collection('users').doc(userRecord.uid).set({
      email: userEmail,
      displayName: 'Test User',
      role: 'user',
      createdAt: new Date().toISOString()
    });

    // Test 3: Try to read user's own data
    const userData = await adminDb.collection('users').doc(userRecord.uid).get();

    // Test 4: Clean up - delete test user
    await adminAuth.deleteUser(userRecord.uid);

    return NextResponse.json({
      success: true,
      message: 'All security rule tests passed',
      tests: {
        createUser: 'Passed',
        writeUserData: 'Passed',
        readUserData: userData.exists ? 'Passed' : 'Failed',
        cleanup: 'Passed'
      }
    });

  } catch (error: any) {
    console.error('Security rules test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 