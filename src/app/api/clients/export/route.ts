import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Client } from '@/lib/services/firebaseService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');

    if (!coachId) {
      return NextResponse.json(
        { error: 'Coach ID is required' },
        { status: 400 }
      );
    }

    const snapshot = await db
      .collection('clients')
      .where('coachId', '==', coachId)
      .get();

    const clients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Client[];

    // Convert to CSV format
    const headers = ['Name', 'Email', 'Goals', 'Last Check-in', 'Status'];
    const rows = clients.map(client => [
      client.name,
      client.email,
      client.goals?.join(', ') || '',
      client.lastCheckIn ? new Date(client.lastCheckIn).toLocaleDateString() : '',
      client.isActive ? 'Active' : 'Inactive'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="clients-${coachId}-${new Date().toISOString()}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting clients:', error);
    return NextResponse.json(
      { error: 'Failed to export clients' },
      { status: 500 }
    );
  }
} 