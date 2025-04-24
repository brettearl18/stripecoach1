import { NextResponse } from 'next/server';
import { updateClient } from '@/lib/services/firebaseService';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;

    // Get current client data and toggle archive status
    const client = await updateClient(clientId, {
      isArchived: true,
      archivedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error archiving client:', error);
    return NextResponse.json(
      { error: 'Failed to archive client' },
      { status: 500 }
    );
  }
} 