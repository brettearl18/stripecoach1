import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';

// GET /api/template-assignments/due - Get all due check-ins for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();

    // Get all active assignments for the user
    const assignmentsRef = db.collection('templateAssignments');
    const assignments = await assignmentsRef
      .where('clientId', '==', userId)
      .where('active', '==', true)
      .orderBy('nextDueDate', 'asc')
      .get();

    const dueCheckIns = [];
    const errors = [];

    for (const doc of assignments.docs) {
      try {
        const assignment = doc.data();
        const nextDueDate = assignment.nextDueDate?.toDate();

        // If the next due date is in the past or today, it's due
        if (nextDueDate && nextDueDate <= now) {
          // Get the template details
          const templateRef = db.collection('templates').doc(assignment.templateId);
          const templateDoc = await templateRef.get();
          
          if (templateDoc.exists) {
            const template = templateDoc.data();
            dueCheckIns.push({
              assignmentId: doc.id,
              templateId: assignment.templateId,
              templateName: template.name,
              templateDescription: template.description,
              templateType: template.type,
              dueDate: nextDueDate.toISOString(),
              frequency: assignment.frequency,
              customDays: assignment.customDays,
              lastCheckInDate: assignment.lastCheckInDate?.toDate()?.toISOString() || null,
              startDate: assignment.startDate?.toDate()?.toISOString()
            });
          } else {
            errors.push(`Template not found for assignment ${doc.id}`);
          }
        }
      } catch (error) {
        console.error(`Error processing assignment ${doc.id}:`, error);
        errors.push(`Error processing assignment ${doc.id}`);
      }
    }

    return NextResponse.json({
      dueCheckIns,
      meta: {
        total: dueCheckIns.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('Error fetching due check-ins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch due check-ins' },
      { status: 500 }
    );
  }
} 