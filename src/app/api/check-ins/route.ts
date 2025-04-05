import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    const db = getFirestore();
    const auth = getAuth();

    // Get coach ID from query params
    const coachId = request.nextUrl.searchParams.get('coachId');
    if (!coachId) {
      return NextResponse.json({ error: 'Coach ID is required' }, { status: 400 });
    }

    // Verify the coach exists
    try {
      await auth.getUser(coachId);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid coach ID' }, { status: 400 });
    }

    // Query check-ins for the coach
    const checkInsSnapshot = await db
      .collection('check-ins')
      .where('coachId', '==', coachId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    // Get client data for each check-in
    const checkIns = await Promise.all(
      checkInsSnapshot.docs.map(async (doc) => {
        const checkIn = doc.data();
        
        // Get client data
        const clientDoc = await db.collection('users').doc(checkIn.clientId).get();
        const clientData = clientDoc.data();

        return {
          id: doc.id,
          clientId: checkIn.clientId,
          clientName: clientData?.displayName || 'Unknown Client',
          date: checkIn.createdAt.toDate().toISOString(),
          type: checkIn.type,
          status: checkIn.status,
          metrics: checkIn.metrics || null,
        };
      })
    );

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
} 