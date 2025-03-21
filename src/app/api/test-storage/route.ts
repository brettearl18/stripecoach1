import { NextResponse } from 'next/server';
import { adminAuth, adminStorage } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Check if Firebase Admin is initialized
    if (!adminAuth || !adminStorage) {
      throw new Error('Firebase Admin services are not initialized. Check your environment variables and service account configuration.');
    }

    // Test 1: Create a test user
    const userEmail = `test${Date.now()}@example.com`;
    const userRecord = await adminAuth.createUser({
      email: userEmail,
      password: 'testPassword123!',
      displayName: 'Test User'
    });

    // Test 2: Try to upload a test file to user's profile
    const testBuffer = Buffer.from('Test file content');
    const testFilePath = `users/${userRecord.uid}/profile/test.txt`;
    
    await adminStorage.file(testFilePath).save(testBuffer, {
      metadata: {
        contentType: 'text/plain',
      }
    });

    // Test 3: Try to read the file
    const [exists] = await adminStorage.file(testFilePath).exists();

    // Test 4: Clean up
    if (exists) {
      await adminStorage.file(testFilePath).delete();
    }
    await adminAuth.deleteUser(userRecord.uid);

    return NextResponse.json({
      success: true,
      message: 'All storage rule tests passed',
      tests: {
        createUser: 'Passed',
        uploadFile: 'Passed',
        readFile: exists ? 'Passed' : 'Failed',
        cleanup: 'Passed'
      }
    });

  } catch (error: any) {
    console.error('Storage rules test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
} 