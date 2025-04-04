import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, name, message, coachId, coachName } = await request.json();

    // Validate input
    if (!email || !name || !message || !coachId || !coachName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create invitation record in Firestore
    const invitationRef = await addDoc(collection(db, 'invitations'), {
      email,
      name,
      message,
      coachId,
      coachName,
      status: 'pending',
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    // Generate invitation link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?invite=${invitationRef.id}`;

    // Email template
    const emailContent = `
      <h2>You've been invited to join Checkin.io!</h2>
      <p>Hello ${name},</p>
      <p>${coachName} has invited you to join their coaching program on Checkin.io.</p>
      <p>Here's a message from your coach:</p>
      <blockquote style="border-left: 2px solid #ccc; margin: 1em 0; padding-left: 1em;">
        ${message.replace(/\n/g, '<br>')}
      </blockquote>
      <p>Click the link below to create your account and get started:</p>
      <p><a href="${inviteLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Accept Invitation</a></p>
      <p>This invitation will expire in 7 days.</p>
      <p>If you have any questions, please contact your coach at their email address.</p>
      <p>Best regards,<br>The Checkin.io Team</p>
    `;

    // Send invitation email
    await sendEmail({
      to: email,
      subject: `${coachName} invited you to join Checkin.io`,
      html: emailContent,
    });

    return NextResponse.json(
      { message: 'Invitation sent successfully', invitationId: invitationRef.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
} 