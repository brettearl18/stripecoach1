import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';
import { TemplateAssignment } from '@/types/checkIn';
import { z } from 'zod';

// Input validation schema
const createAssignmentSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  frequency: z.enum(['weekly', 'monthly', 'custom'], {
    errorMap: () => ({ message: 'Invalid frequency value' })
  }),
  customDays: z.number().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  })
});

// GET /api/template-assignments - Get all template assignments for the coach's clients
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coachId = session.user.id;
    const assignmentsRef = db.collection('templateAssignments');
    const assignments = await assignmentsRef
      .where('coachId', '==', coachId)
      .where('active', '==', true)
      .orderBy('nextDueDate', 'asc')
      .get();

    const assignmentsData = assignments.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      nextDueDate: doc.data().nextDueDate?.toDate(),
      lastCheckInDate: doc.data().lastCheckInDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));

    return NextResponse.json({ assignments: assignmentsData });
  } catch (error) {
    console.error('Error fetching template assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template assignments' },
      { status: 500 }
    );
  }
}

// POST /api/template-assignments - Create a new template assignment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coachId = session.user.id;
    const body = await request.json();

    // Validate input
    const validationResult = createAssignmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { templateId, clientId, frequency, customDays, startDate } = validationResult.data;

    // Verify the client belongs to the coach
    const clientRef = db.collection('clients').doc(clientId);
    const clientDoc = await clientRef.get();
    
    if (!clientDoc.exists) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    if (clientDoc.data()?.coachId !== coachId) {
      return NextResponse.json({ error: 'Unauthorized access to client' }, { status: 403 });
    }

    // Verify the template exists and belongs to the coach
    const templateRef = db.collection('templates').doc(templateId);
    const templateDoc = await templateRef.get();
    
    if (!templateDoc.exists) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    if (templateDoc.data()?.coachId !== coachId) {
      return NextResponse.json({ error: 'Unauthorized access to template' }, { status: 403 });
    }

    // Check for existing active assignment
    const existingAssignment = await assignmentsRef
      .where('clientId', '==', clientId)
      .where('templateId', '==', templateId)
      .where('active', '==', true)
      .get();

    if (!existingAssignment.empty) {
      return NextResponse.json(
        { error: 'Client already has an active assignment for this template' },
        { status: 409 }
      );
    }

    // Calculate next due date based on frequency
    const nextDueDate = calculateNextDueDate(new Date(startDate), frequency, customDays);

    const assignment: Omit<TemplateAssignment, 'id'> = {
      templateId,
      clientId,
      coachId,
      frequency,
      customDays,
      startDate: new Date(startDate),
      active: true,
      nextDueDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const assignmentRef = db.collection('templateAssignments').doc();
    await assignmentRef.set(assignment);

    return NextResponse.json({
      success: true,
      assignment: { 
        id: assignmentRef.id, 
        ...assignment,
        startDate: assignment.startDate.toISOString(),
        nextDueDate: assignment.nextDueDate.toISOString(),
        createdAt: assignment.createdAt.toISOString(),
        updatedAt: assignment.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating template assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create template assignment' },
      { status: 500 }
    );
  }
}

// Helper function to calculate next due date
function calculateNextDueDate(startDate: Date, frequency: string, customDays?: number): Date {
  const date = new Date(startDate);
  
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'custom':
      if (!customDays || customDays < 1) {
        throw new Error('Custom days must be a positive number');
      }
      date.setDate(date.getDate() + customDays);
      break;
    default:
      throw new Error('Invalid frequency');
  }
  
  return date;
} 