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
    const coachPhoto = 'https://app.vanahealth.com/logo.png'; // Replace with actual coach photo if available
    const primaryColor = '#4F46E5';
    const emailContent = `
      <div style="font-family: 'Inter', Arial, sans-serif; background: #f9f9fb; padding: 32px; color: #222;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 2px 8px rgba(79,70,229,0.08); overflow: hidden;">
          <div style="background: ${primaryColor}; padding: 24px 0; text-align: center;">
            <img src="${coachPhoto}" alt="Coach Logo" style="height: 56px; margin-bottom: 8px; border-radius: 50%; background: #fff; padding: 4px;" />
            <h2 style="color: #fff; margin: 0; font-size: 1.5rem;">Welcome to Vana Health!</h2>
          </div>
          <div style="padding: 32px 24px 24px 24px;">
            <p style="font-size: 1.1rem; margin-bottom: 12px;">Hi ${name},</p>
            <p style="margin-bottom: 16px;">${coachName} has invited you to join their coaching program on <b>Vana Health</b>.</p>
            <div style="margin-bottom: 18px;">
              <b>Here's a message from your coach:</b>
              <blockquote style="border-left: 3px solid ${primaryColor}; margin: 1em 0; padding-left: 1em; color: #555; background: #f3f4f6; border-radius: 6px;">${message.replace(/\n/g, '<br>')}</blockquote>
            </div>
            <div style="margin-bottom: 18px;">
              <b>What to expect:</b>
              <ul style="margin: 8px 0 16px 20px; color: #444;">
                <li>Set up your profile and preferences</li>
                <li>Choose your health and fitness goals</li>
                <li>Connect with your coach for personalized support</li>
                <li>Track your progress and celebrate wins!</li>
              </ul>
            </div>
            <a href="${inviteLink}" style="display: inline-block; background: ${primaryColor}; color: #fff; padding: 14px 32px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 1.1rem; margin-bottom: 18px;">Accept Invitation</a>
            <p style="font-size: 0.95rem; color: #666; margin-top: 18px;">This invitation will expire in 7 days.</p>
            <p style="font-size: 0.95rem; color: #666;">If you have any questions, please contact your coach at their email address.</p>
            <p style="font-size: 0.95rem; color: #aaa; margin-top: 24px;">Best regards,<br>The Vana Health Team</p>
          </div>
        </div>
      </div>
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