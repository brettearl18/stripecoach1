import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: EmailParams) {
  try {
    const msg = {
      to,
      from: from || process.env.SENDGRID_FROM_EMAIL || 'noreply@checkin.io',
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
} 