import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { clientInfo, measurements, weightProgress, healthMetrics, goals, email } = data;

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Create email content
    const emailContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { color: #4F46E5; margin-bottom: 10px; }
            .metric { margin: 5px 0; }
            .positive-change { color: #059669; }
            .negative-change { color: #DC2626; }
            .footer { text-align: center; font-size: 12px; color: #6B7280; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Progress Report</h1>
              <p>Generated for ${clientInfo.name}</p>
            </div>

            <div class="section">
              <h2 class="section-title">Weight Progress</h2>
              <div class="metric">Starting Weight: ${weightProgress.initial} lbs</div>
              <div class="metric">Current Weight: ${weightProgress.current} lbs</div>
              <div class="metric ${weightProgress.change <= 0 ? 'positive-change' : 'negative-change'}">
                Total Change: ${weightProgress.change} lbs
              </div>
              <div class="metric">Progress to Goal: ${weightProgress.percentageComplete.toFixed(1)}%</div>
            </div>

            <div class="section">
              <h2 class="section-title">Body Measurements</h2>
              ${Object.entries(measurements.changes)
                .map(([key, data]: [string, any]) => {
                  const change = data.value > 0 ? `+${data.value}` : data.value;
                  return `
                    <div class="metric">
                      ${key.charAt(0).toUpperCase() + key.slice(1)}: 
                      <span class="${data.value <= 0 ? 'positive-change' : 'negative-change'}">
                        ${change} ${data.unit}
                      </span>
                    </div>
                  `;
                })
                .join('')}
            </div>

            <div class="section">
              <h2 class="section-title">Health Metrics</h2>
              <div class="metric">Sleep Quality: ${healthMetrics.sleep.change} change</div>
              <div class="metric">Energy Levels: ${healthMetrics.energy.change} change</div>
              <div class="metric">Stress Levels: ${healthMetrics.stress.change} change</div>
            </div>

            <div class="section">
              <h2 class="section-title">Goals Progress</h2>
              <div class="metric">Completed Goals: ${goals.completed}/${goals.total}</div>
              <div class="metric">Completion Rate: ${goals.percentage}%</div>
            </div>

            <div class="footer">
              Report generated on ${new Date().toLocaleDateString()} by Stripe Coach
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Progress Report - ${new Date().toLocaleDateString()}`,
      html: emailContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 