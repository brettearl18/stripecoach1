import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Try to list users (limited to 1) to verify admin SDK works
    await adminAuth.listUsers(1);
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Firebase Admin SDK is properly configured'
    });
  } catch (error) {
    console.error('Firebase Admin SDK Error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Firebase Admin SDK configuration error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 