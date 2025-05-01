import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { clientId, assessmentId, scheduledDate } = await request.json();

    if (!clientId || !assessmentId || !scheduledDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const scheduledAssessment = {
      clientId,
      assessmentId,
      scheduledDate,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('scheduledAssessments').add(scheduledAssessment);

    return NextResponse.json({
      id: docRef.id,
      ...scheduledAssessment
    });
  } catch (error) {
    console.error('Error scheduling assessment:', error);
    return NextResponse.json(
      { error: 'Failed to schedule assessment' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const snapshot = await db
      .collection('scheduledAssessments')
      .where('clientId', '==', clientId)
      .orderBy('scheduledDate', 'desc')
      .get();

    const assessments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching scheduled assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled assessments' },
      { status: 500 }
    );
  }
} 