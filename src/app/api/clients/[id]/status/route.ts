import { NextResponse } from 'next/server';
import { updateClient } from '@/lib/services/firebaseService';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const clientId = params.id;

    // Validate status
    const validStatuses = ['on_track', 'needs_attention', 'at_risk'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update client status
    await updateClient(clientId, { status });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating client status:', error);
    return NextResponse.json(
      { error: 'Failed to update client status' },
      { status: 500 }
    );
  }
} 