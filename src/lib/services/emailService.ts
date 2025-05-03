import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import sgMail from '@sendgrid/mail';
import { Resend } from 'resend';

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const FROM_EMAIL = 'security@stripecoach.com';

interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

const emailTemplates = {
  checkInReminder: (data: { clientName: string; coachName: string; dueDate: string }) => ({
    subject: `Check-in Reminder: ${data.dueDate}`,
    html: `
      <h1>Time for Your Check-in!</h1>
      <p>Hi ${data.clientName},</p>
      <p>This is a friendly reminder that your check-in is due ${data.dueDate}.</p>
      <p>Your coach ${data.coachName} is looking forward to seeing your progress!</p>
      <p>Click here to submit your check-in: <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/check-in">Submit Check-in</a></p>
    `
  }),
  
  checkInSubmitted: (data: { clientName: string; coachName: string }) => ({
    subject: 'New Check-in Submitted',
    html: `
      <h1>New Check-in Submitted</h1>
      <p>Hi ${data.coachName},</p>
      <p>${data.clientName} has submitted their check-in.</p>
      <p>Click here to review: <a href="${process.env.NEXT_PUBLIC_APP_URL}/coach/check-ins">Review Check-in</a></p>
    `
  })
};

export const emailService = {
  async sendEmail({ to, subject, template, data }: EmailData) {
    try {
      const templateData = emailTemplates[template as keyof typeof emailTemplates](data);
      
      const response = await resend.emails.send({
        from: 'Stripe Coach <notifications@stripecoach.com>',
        to,
        subject: templateData.subject,
        html: templateData.html,
      });

      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email notification');
    }
  }
};

export async function send2FAEnabledEmail(userId: string) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return;

  const user = userDoc.data();
  
  const emailOptions: EmailOptions = {
    to: user.email,
    subject: 'Two-Factor Authentication Enabled',
    text: `Two-factor authentication has been enabled for your Stripe Coach account. If you did not make this change, please contact support immediately.`,
    html: `
      <h2>Two-Factor Authentication Enabled</h2>
      <p>Two-factor authentication has been enabled for your Stripe Coach account.</p>
      <p>This change was made on ${new Date().toLocaleString()}</p>
      <p><strong>If you did not make this change, please contact support immediately.</strong></p>
    `,
  };

  await sgMail.send({
    ...emailOptions,
    from: FROM_EMAIL,
  });
}

export async function send2FADisabledEmail(userId: string) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return;

  const user = userDoc.data();
  
  const emailOptions: EmailOptions = {
    to: user.email,
    subject: 'Two-Factor Authentication Disabled',
    text: `Two-factor authentication has been disabled for your Stripe Coach account. If you did not make this change, please contact support immediately.`,
    html: `
      <h2>Two-Factor Authentication Disabled</h2>
      <p>Two-factor authentication has been disabled for your Stripe Coach account.</p>
      <p>This change was made on ${new Date().toLocaleString()}</p>
      <p><strong>If you did not make this change, please contact support immediately.</strong></p>
    `,
  };

  await sgMail.send({
    ...emailOptions,
    from: FROM_EMAIL,
  });
}

export async function sendBackupCodesRegeneratedEmail(userId: string) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return;

  const user = userDoc.data();
  
  const emailOptions: EmailOptions = {
    to: user.email,
    subject: 'Two-Factor Authentication Backup Codes Regenerated',
    text: `Your backup codes for two-factor authentication have been regenerated. If you did not make this change, please contact support immediately.`,
    html: `
      <h2>Backup Codes Regenerated</h2>
      <p>Your backup codes for two-factor authentication have been regenerated.</p>
      <p>This change was made on ${new Date().toLocaleString()}</p>
      <p><strong>If you did not make this change, please contact support immediately.</strong></p>
    `,
  };

  await sgMail.send({
    ...emailOptions,
    from: FROM_EMAIL,
  });
}

export async function sendEmail(options: EmailOptions) {
  try {
    await sgMail.send({
      ...options,
      from: FROM_EMAIL,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
} 