import { NextResponse } from 'next/server';
import { getClient, updateClient } from '@/lib/services/firebaseService';
import { sendEmail } from '@/lib/services/emailService';

export async function POST(request: Request) {
  try {
    const { clientId, documents } = await request.json();

    // Validate required fields
    if (!clientId || !documents) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get client data
    const client = await getClient(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Generate secure access links for each document
    const documentLinks = await Promise.all(
      documents.map(async (docId) => {
        const accessToken = generateSecureToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Links expire in 7 days

        return {
          id: docId,
          accessUrl: `${process.env.NEXT_PUBLIC_APP_URL}/documents/${docId}?token=${accessToken}`,
          expiresAt
        };
      })
    );

    // Update client record with welcome packet status
    await updateClient(clientId, {
      welcomePacket: {
        sentAt: new Date().toISOString(),
        documents: documentLinks,
        status: 'sent'
      }
    });

    // Send welcome email with document links
    await sendEmail({
      to: client.email,
      subject: 'Welcome to Your Coaching Journey',
      template: 'welcome-packet',
      data: {
        name: client.name,
        coachName: client.coach?.name || 'Your Coach',
        documents: documentLinks,
        nextSteps: [
          'Review and complete all required documents',
          'Schedule your initial assessment',
          'Download our mobile app',
          'Join our client community'
        ],
        appDownloadLink: process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL,
        communityLink: process.env.NEXT_PUBLIC_COMMUNITY_URL
      }
    });

    return NextResponse.json({
      success: true,
      sentAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending welcome packet:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome packet' },
      { status: 500 }
    );
  }
}

function generateSecureToken(): string {
  // Implementation would use a secure random token generator
  // This is just a simple example
  return Math.random().toString(36).substring(2) +
         Math.random().toString(36).substring(2);
} 