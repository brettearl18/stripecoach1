import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const FROM_EMAIL = 'security@stripecoach.com';

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