import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';
import { z } from 'zod';

const checkInSchema = z.object({
  assignmentId: z.string().min(1, 'Assignment ID is required'),
  fields: z.record(z.any()), // e.g., { weight: 80, waist: 32 }
  photos: z.array(z.string().url()).optional(), // array of photo URLs
});

export async function GET(request: NextRequest) {
  try {
    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    const db = getFirestore();
    const auth = getAuth();

    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for assignmentId or coachId in query
    const assignmentId = request.nextUrl.searchParams.get('assignmentId');
    const coachId = request.nextUrl.searchParams.get('coachId');

    if (assignmentId) {
      // Fetch assignment to check ownership
      const assignmentRef = db.collection('templateAssignments').doc(assignmentId);
      const assignmentDoc = await assignmentRef.get();
      if (!assignmentDoc.exists) {
        return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
      }
      const assignment = assignmentDoc.data();
      // Only allow the client or coach to fetch
      if (
        session.user.id !== assignment.clientId &&
        session.user.id !== assignment.coachId
      ) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // Query check-ins for the assignment
      const checkInsSnapshot = await db
        .collection('checkIns')
        .where('assignmentId', '==', assignmentId)
        .orderBy('createdAt', 'desc')
        .get();
      const checkIns = checkInsSnapshot.docs.map((doc) => {
        const checkIn = doc.data();
        return {
          id: doc.id,
          createdAt: checkIn.createdAt.toDate().toISOString(),
          fields: checkIn.fields,
          photos: checkIn.photos,
        };
      });
      return NextResponse.json(checkIns);
    }

    // Fallback: coachId (coach check-in history, as before)
    if (coachId) {
      if (session.user.role !== 'coach') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (coachId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // Verify the coach exists
      try {
        await auth.getUser(coachId);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid coach ID' }, { status: 400 });
      }
      // Query check-ins for the coach
      const checkInsSnapshot = await db
        .collection('checkIns')
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
    }

    // If neither assignmentId nor coachId provided
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clientId = session.user.id;
    const body = await request.json();
    const validation = checkInSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }
    const { assignmentId, fields, photos } = validation.data;
    // Fetch assignment and validate ownership
    const assignmentRef = db.collection('templateAssignments').doc(assignmentId);
    const assignmentDoc = await assignmentRef.get();
    if (!assignmentDoc.exists) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    const assignment = assignmentDoc.data();
    if (assignment.clientId !== clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (!assignment.active) {
      return NextResponse.json({ error: 'Assignment is not active' }, { status: 400 });
    }
    // Save check-in
    const checkIn = {
      assignmentId,
      clientId,
      templateId: assignment.templateId,
      coachId: assignment.coachId,
      createdAt: new Date(),
      fields,
      photos: photos || [],
    };
    const checkInRef = db.collection('checkIns').doc();
    await checkInRef.set(checkIn);
    // Update assignment's lastCheckInDate and nextDueDate
    const now = new Date();
    let nextDueDate = new Date(now);
    switch (assignment.frequency) {
      case 'weekly':
        nextDueDate.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextDueDate.setMonth(now.getMonth() + 1);
        break;
      case 'custom':
        nextDueDate.setDate(now.getDate() + (assignment.customDays || 7));
        break;
      default:
        nextDueDate = now;
    }
    await assignmentRef.update({
      lastCheckInDate: now,
      nextDueDate,
      updatedAt: now,
    });
    return NextResponse.json({ success: true, checkInId: checkInRef.id });
  } catch (error) {
    console.error('Error submitting check-in:', error);
    return NextResponse.json({ error: 'Failed to submit check-in' }, { status: 500 });
  }
} 