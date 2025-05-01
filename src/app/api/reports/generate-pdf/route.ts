import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redis, cache } from '@/lib/redis';
import PDFDocument from 'pdfkit';
import { generateCharts } from '@/lib/charts';
import { analyzeProgress } from '@/lib/ai';
import { Report, ReportCategory as ReportType, ReportStatus } from '@/types/reports';

const CACHE_TTL = 3600; // 1 hour

async function getCachedReport(reportId: string): Promise<Buffer | null> {
  return redis.get<Buffer>(`report:${reportId}`);
}

async function cacheReport(reportId: string, pdfBuffer: Buffer): Promise<void> {
  await redis.setex(`report:${reportId}`, CACHE_TTL, pdfBuffer);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, type = ReportType.PROGRESS, options = {} } = await req.json();
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Check if client exists and user has access
    const client = await db.client.findFirst({
      where: {
        id: clientId,
        coachId: session.user.id,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Create report record
    const report = await db.report.create({
      data: {
        clientId,
        coachId: session.user.id,
        type,
        status: ReportStatus.GENERATING,
      },
    });

    // Try to get cached report first
    const cachedPdf = await getCachedReport(report.id);
    if (cachedPdf) {
      return new NextResponse(cachedPdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="report-${report.id}.pdf"`,
        },
      });
    }

    // Generate report data
    const [metrics, checkIns] = await Promise.all([
      db.metric.findMany({ where: { clientId } }),
      db.checkIn.findMany({ where: { clientId } }),
    ]);

    // Generate visual data
    const charts = await generateCharts(metrics, checkIns);
    
    // Generate AI analysis if requested
    let aiAnalysis = null;
    if (options.includeAiAnalysis) {
      aiAnalysis = await analyzeProgress(metrics, checkIns);
    }

    // Create PDF
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    
    // Add content to PDF
    doc
      .fontSize(24)
      .text('Progress Report', { align: 'center' })
      .moveDown();

    // Client Information
    doc
      .fontSize(16)
      .text('Client Information')
      .fontSize(12)
      .text(`Name: ${client.firstName} ${client.lastName}`)
      .text(`Email: ${client.email}`)
      .moveDown();

    // AI Analysis Section
    if (aiAnalysis) {
      doc
        .fontSize(16)
        .text('AI Analysis')
        .fontSize(12)
        .text(aiAnalysis)
        .moveDown();
    }

    // Add charts and metrics
    charts.forEach((chart, index) => {
      doc.addPage().image(chart, {
        fit: [500, 300],
        align: 'center',
      });
    });

    // Finalize PDF
    doc.end();

    const pdfBuffer = Buffer.concat(chunks);
    
    // Cache the generated PDF
    await cacheReport(report.id, pdfBuffer);

    // Update report status
    await db.report.update({
      where: { id: report.id },
      data: { status: ReportStatus.COMPLETED },
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${report.id}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}