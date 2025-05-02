import { NextRequest, NextResponse } from 'next/server';
import { exportData } from '@/lib/services/advancedAnalyticsService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dataType, format, filters } = await req.json();

    // Validate request
    if (!dataType || !format) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Generate export
    const exportBlob = await exportData(dataType, format, filters);

    // Set appropriate headers based on format
    const headers = new Headers();
    switch (format) {
      case 'csv':
        headers.set('Content-Type', 'text/csv');
        headers.set('Content-Disposition', `attachment; filename=${dataType}-export.csv`);
        break;
      case 'json':
        headers.set('Content-Type', 'application/json');
        headers.set('Content-Disposition', `attachment; filename=${dataType}-export.json`);
        break;
      case 'excel':
        headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        headers.set('Content-Disposition', `attachment; filename=${dataType}-export.xlsx`);
        break;
    }

    return new NextResponse(exportBlob, { headers });
  } catch (error) {
    console.error('Error handling export request:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
} 