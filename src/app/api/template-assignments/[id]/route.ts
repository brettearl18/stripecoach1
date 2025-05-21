import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';
import { z } from 'zod';

const updateAssignmentSchema = z.object({
  frequency: z.enum(['weekly', 'monthly', 'custom']),
  customDays: z.number().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const coachId = session.user.id;
    const assignmentId = params.id;
    const body = await request.json();
    const validation = updateAssignmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }
    // Fetch assignment and check ownership
    const assignmentRef = db.collection('templateAssignments').doc(assignmentId);
    const assignmentDoc = await assignmentRef.get();
    if (!assignmentDoc.exists) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    const assignment = assignmentDoc.data();
    if (assignment.coachId !== coachId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Update assignment
    await assignmentRef.update({
      ...validation.data,
      updatedAt: new Date(),
    });
    const updatedDoc = await assignmentRef.get();
    return NextResponse.json({ id: assignmentId, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const coachId = session.user.id;
    const assignmentId = params.id;
    // Fetch assignment and check ownership
    const assignmentRef = db.collection('templateAssignments').doc(assignmentId);
    const assignmentDoc = await assignmentRef.get();
    if (!assignmentDoc.exists) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    const assignment = assignmentDoc.data();
    if (assignment.coachId !== coachId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await assignmentRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
  }
} 