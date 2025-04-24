import { NextResponse } from 'next/server';
import { getClient } from '@/lib/services/firebaseService';
import { sendEmail } from '@/lib/services/emailService';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;

    // Get client data
    const client = await getClient(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Send reminder email
    await sendEmail({
      to: client.email,
      subject: 'Check-in Reminder',
      template: 'check-in-reminder',
      data: {
        name: client.name,
        coachName: client.coach?.name || 'Your Coach',
        checkInLink: `${process.env.NEXT_PUBLIC_APP_URL}/client/check-in`,
      }
    });

    // Send push notification if enabled
    if (client.notificationPreferences?.pushEnabled) {
      // Implement push notification logic here
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    );
  }
} 