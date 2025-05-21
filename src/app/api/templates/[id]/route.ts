import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';
import { z } from 'zod';

const updateTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  // Add more fields as needed
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const coachId = session.user.id;
    const templateId = params.id;
    const body = await request.json();
    const validation = updateTemplateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }
    // Fetch template and check ownership
    const templateRef = db.collection('templates').doc(templateId);
    const templateDoc = await templateRef.get();
    if (!templateDoc.exists) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    const template = templateDoc.data();
    if (template.coachId !== coachId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Update template
    await templateRef.update({
      ...validation.data,
      updatedAt: new Date(),
    });
    const updatedDoc = await templateRef.get();
    return NextResponse.json({ id: templateId, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
} 