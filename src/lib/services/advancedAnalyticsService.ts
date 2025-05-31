import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { Client, Coach } from '@/types';
import { ReportGenerationOptions } from '@/types/reports';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

export interface AdvancedAnalytics {
  clientMetrics: {
    engagement: {
      weeklyActive: number;
      checkInCompletion: number;
      photoSubmissionRate: number;
      feedbackResponseRate: number;
    };
    progress: {
      weightChange: number;
      measurements: Record<string, number>;
      goalCompletion: number;
      programAdherence: number;
    };
    financial: {
      lifetimeValue: number;
      subscriptionValue: number;
      churnRisk: number;
      upsellPotential: number;
    };
  };
  coachMetrics: {
    performance: {
      clientRetention: number;
      averageResponseTime: number;
      clientSatisfaction: number;
      programCompletion: number;
    };
    engagement: {
      activeClients: number;
      sessionCompletion: number;
      resourceUsage: number;
      communicationFrequency: number;
    };
  };
  businessMetrics: {
    revenue: {
      monthly: number;
      projected: number;
      perClient: number;
      growth: number;
    };
    growth: {
      newClients: number;
      churnRate: number;
      expansionRevenue: number;
      netRetention: number;
    };
  };
}

export async function generateAdvancedAnalytics(
  companyId: string,
  dateRange: { start: Date; end: Date }
): Promise<AdvancedAnalytics> {
  try {
    // Fetch all relevant data
    const [clients, coaches, checkIns] = await Promise.all([
      getClients(companyId),
      getCoaches(companyId),
      getCheckIns(companyId, dateRange)
    ]);

    // Calculate client metrics
    const clientMetrics = calculateClientMetrics(clients, checkIns);

    // Calculate coach metrics
    const coachMetrics = calculateCoachMetrics(coaches, clients, checkIns);

    // Calculate business metrics
    const businessMetrics = calculateBusinessMetrics(clients, coaches, dateRange);

    return {
      clientMetrics,
      coachMetrics,
      businessMetrics
    };
  } catch (error) {
    console.error('Error generating advanced analytics:', error);
    throw error;
  }
}

export async function generateReport(
  options: ReportGenerationOptions
): Promise<Blob> {
  try {
    const { templateId, dateRange, includeAIAnalysis, includePreviousComparisons, format } = options;

    // Fetch data based on template
    const data = await fetchReportData(templateId, dateRange);

    // Generate report based on format
    let report: Blob;
    switch (format) {
      case 'pdf':
        report = await generatePDFReport(data, includeAIAnalysis, includePreviousComparisons);
        break;
      case 'email':
        report = await generateEmailReport(data, includeAIAnalysis, includePreviousComparisons);
        break;
      case 'dashboard':
        report = await generateDashboardReport(data, includeAIAnalysis, includePreviousComparisons);
        break;
      default:
        throw new Error('Unsupported report format');
    }

    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

export async function exportData(
  dataType: 'clients' | 'coaches' | 'checkIns' | 'analytics',
  format: 'csv' | 'json' | 'excel',
  filters?: Record<string, any>
): Promise<Blob> {
  try {
    // Fetch data based on type and filters
    const data = await fetchExportData(dataType, filters);

    // Convert to requested format
    let exportBlob: Blob;
    switch (format) {
      case 'csv':
        exportBlob = await convertToCSV(data);
        break;
      case 'json':
        exportBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        break;
      case 'excel':
        exportBlob = await convertToExcel(data);
        break;
      default:
        throw new Error('Unsupported export format');
    }

    return exportBlob;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}

// Helper functions
async function getClients(companyId: string) {
  const clientsRef = collection(db, 'clients');
  const q = query(
    clientsRef, 
    where('companyId', '==', companyId),
    where('status', '==', 'active')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getCoaches(companyId: string) {
  const coachesRef = collection(db, 'coaches');
  const q = query(
    coachesRef, 
    where('companyId', '==', companyId),
    where('status', '==', 'active')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getCheckIns(companyId: string, dateRange: { start: Date; end: Date }) {
  const checkInsRef = collection(db, 'checkIns');
  const q = query(
    checkInsRef,
    where('companyId', '==', companyId),
    where('timestamp', '>=', Timestamp.fromDate(dateRange.start)),
    where('timestamp', '<=', Timestamp.fromDate(dateRange.end)),
    where('status', '==', 'completed')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function calculateClientMetrics(clients: any[], checkIns: any[]) {
  const totalClients = clients.length;
  if (totalClients === 0) return {
    engagement: {
      weeklyActive: 0,
      checkInCompletion: 0,
      photoSubmissionRate: 0,
      feedbackResponseRate: 0
    },
    progress: {
      weightChange: 0,
      measurements: {},
      goalCompletion: 0,
      programAdherence: 0
    },
    financial: {
      lifetimeValue: 0,
      subscriptionValue: 0,
      churnRisk: 0,
      upsellPotential: 0
    }
  };

  // Calculate engagement metrics
  const weeklyActive = clients.filter(client => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return client.lastLoginAt && new Date(client.lastLoginAt) > lastWeek;
  }).length;

  const checkInCompletion = checkIns.length / (totalClients * 7) * 100; // Assuming weekly check-ins
  const photoSubmissionRate = checkIns.filter(ci => ci.photos?.length > 0).length / checkIns.length * 100;
  const feedbackResponseRate = checkIns.filter(ci => ci.feedback).length / checkIns.length * 100;

  // Calculate progress metrics
  const weightChange = clients.reduce((acc, client) => {
    const initialWeight = client.initialWeight || 0;
    const currentWeight = client.currentWeight || 0;
    return acc + (currentWeight - initialWeight);
  }, 0) / totalClients;

  const measurements = clients.reduce((acc, client) => {
    Object.entries(client.measurements || {}).forEach(([key, value]) => {
      acc[key] = (acc[key] || 0) + (value as number);
    });
    return acc;
  }, {} as Record<string, number>);

  const goalCompletion = clients.filter(client => client.goals?.every(g => g.completed)).length / totalClients * 100;
  const programAdherence = checkIns.filter(ci => ci.completed).length / checkIns.length * 100;

  // Calculate financial metrics
  const lifetimeValue = clients.reduce((acc, client) => acc + (client.totalSpent || 0), 0) / totalClients;
  const subscriptionValue = clients.reduce((acc, client) => acc + (client.subscription?.amount || 0), 0) / totalClients;
  const churnRisk = clients.filter(client => {
    const lastActivity = new Date(client.lastActivity || 0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastActivity < thirtyDaysAgo;
  }).length / totalClients * 100;
  const upsellPotential = clients.filter(client => client.subscription?.tier === 'basic').length / totalClients * 100;

  return {
    engagement: {
      weeklyActive: (weeklyActive / totalClients) * 100,
      checkInCompletion,
      photoSubmissionRate,
      feedbackResponseRate
    },
    progress: {
      weightChange,
      measurements,
      goalCompletion,
      programAdherence
    },
    financial: {
      lifetimeValue,
      subscriptionValue,
      churnRisk,
      upsellPotential
    }
  };
}

function calculateCoachMetrics(coaches: any[], clients: any[], checkIns: any[]) {
  const totalCoaches = coaches.length;
  if (totalCoaches === 0) return {
    performance: {
      clientRetention: 0,
      averageResponseTime: 0,
      clientSatisfaction: 0,
      programCompletion: 0
    },
    engagement: {
      activeClients: 0,
      sessionCompletion: 0,
      resourceUsage: 0,
      communicationFrequency: 0
    }
  };

  // Calculate performance metrics
  const clientRetention = coaches.map(coach => {
    const coachClients = clients.filter(client => client.coachId === coach.id);
    const activeClients = coachClients.filter(client => client.status === 'active').length;
    return (activeClients / coachClients.length) * 100;
  }).reduce((acc, val) => acc + val, 0) / totalCoaches;

  const averageResponseTime = coaches.map(coach => {
    const coachCheckIns = checkIns.filter(ci => ci.coachId === coach.id);
    return coachCheckIns.reduce((acc, ci) => acc + (ci.responseTime || 0), 0) / coachCheckIns.length;
  }).reduce((acc, val) => acc + val, 0) / totalCoaches;

  const clientSatisfaction = coaches.map(coach => {
    const coachClients = clients.filter(client => client.coachId === coach.id);
    return coachClients.reduce((acc, client) => acc + (client.satisfaction || 0), 0) / coachClients.length;
  }).reduce((acc, val) => acc + val, 0) / totalCoaches;

  const programCompletion = checkIns.filter(ci => ci.completed).length / checkIns.length * 100;

  // Calculate engagement metrics
  const activeClients = clients.filter(client => client.status === 'active').length / totalCoaches;
  const sessionCompletion = checkIns.filter(ci => ci.completed).length / checkIns.length * 100;
  const resourceUsage = coaches.reduce((acc, coach) => acc + (coach.resourceUsage || 0), 0) / totalCoaches;
  const communicationFrequency = checkIns.filter(ci => ci.hasCommunication).length / checkIns.length * 100;

  return {
    performance: {
      clientRetention,
      averageResponseTime,
      clientSatisfaction,
      programCompletion
    },
    engagement: {
      activeClients,
      sessionCompletion,
      resourceUsage,
      communicationFrequency
    }
  };
}

function calculateBusinessMetrics(clients: any[], coaches: any[], dateRange: { start: Date; end: Date }) {
  const totalClients = clients.length;
  const totalCoaches = coaches.length;
  if (totalClients === 0 || totalCoaches === 0) return {
    revenue: {
      monthly: 0,
      projected: 0,
      perClient: 0,
      growth: 0
    },
    growth: {
      newClients: 0,
      churnRate: 0,
      expansionRevenue: 0,
      netRetention: 0
    }
  };

  // Calculate revenue metrics
  const monthly = clients.reduce((acc, client) => acc + (client.subscription?.amount || 0), 0);
  const projected = monthly * 12;
  const perClient = monthly / totalClients;
  const growth = ((monthly - (monthly * 0.9)) / (monthly * 0.9)) * 100; // Assuming 10% growth

  // Calculate growth metrics
  const newClients = clients.filter(client => {
    const startDate = new Date(client.startDate);
    return startDate >= dateRange.start && startDate <= dateRange.end;
  }).length;

  const churnRate = clients.filter(client => {
    const endDate = new Date(client.endDate || 0);
    return endDate >= dateRange.start && endDate <= dateRange.end;
  }).length / totalClients * 100;

  const expansionRevenue = clients.reduce((acc, client) => {
    const upgrades = client.upgrades || [];
    return acc + upgrades.reduce((sum, upgrade) => sum + upgrade.amount, 0);
  }, 0);

  const netRetention = ((totalClients - churnRate) / totalClients) * 100;

  return {
    revenue: {
      monthly,
      projected,
      perClient,
      growth
    },
    growth: {
      newClients,
      churnRate,
      expansionRevenue,
      netRetention
    }
  };
}

async function fetchReportData(templateId: string, dateRange: { start: string; end: string }) {
  // Implementation of report data fetching
  return {};
}

async function generatePDFReport(data: any, includeAIAnalysis: boolean, includePreviousComparisons: boolean) {
  return new Promise<Blob>((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      // Collect PDF chunks
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBlob = new Blob(chunks, { type: 'application/pdf' });
        resolve(pdfBlob);
      });

      // Add title
      doc.fontSize(24).text('Analytics Report', { align: 'center' });
      doc.moveDown();

      // Add date
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown();

      // Add summary section
      doc.fontSize(16).text('Summary');
      doc.fontSize(12).text('This report contains detailed analytics and insights about your business performance.');
      doc.moveDown();

      // Add metrics section
      doc.fontSize(16).text('Key Metrics');
      if (data.clientMetrics) {
        doc.fontSize(14).text('Client Metrics');
        doc.fontSize(12).text(`Active Clients: ${data.clientMetrics.engagement.weeklyActive}`);
        doc.text(`Check-in Completion: ${data.clientMetrics.engagement.checkInCompletion}%`);
        doc.text(`Program Adherence: ${data.clientMetrics.progress.programAdherence}%`);
        doc.moveDown();
      }

      if (data.coachMetrics) {
        doc.fontSize(14).text('Coach Metrics');
        doc.fontSize(12).text(`Client Retention: ${data.coachMetrics.performance.clientRetention}%`);
        doc.text(`Average Response Time: ${data.coachMetrics.performance.averageResponseTime} hours`);
        doc.text(`Client Satisfaction: ${data.coachMetrics.performance.clientSatisfaction}%`);
        doc.moveDown();
      }

      if (data.businessMetrics) {
        doc.fontSize(14).text('Business Metrics');
        doc.fontSize(12).text(`Monthly Revenue: $${data.businessMetrics.revenue.monthly}`);
        doc.text(`Projected Annual: $${data.businessMetrics.revenue.projected}`);
        doc.text(`Growth Rate: ${data.businessMetrics.revenue.growth}%`);
        doc.moveDown();
      }

      // Add AI Analysis if requested
      if (includeAIAnalysis) {
        doc.fontSize(16).text('AI Analysis');
        doc.fontSize(12).text('Based on the current metrics, here are some key insights:');
        // Add AI-generated insights here
        doc.moveDown();
      }

      // Add previous comparisons if requested
      if (includePreviousComparisons) {
        doc.fontSize(16).text('Historical Comparison');
        doc.fontSize(12).text('Comparison with previous periods:');
        // Add comparison data here
        doc.moveDown();
      }

      // Add footer
      doc.fontSize(10).text('Generated by Stripe Coach Analytics', { align: 'center' });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function generateEmailReport(data: any, includeAIAnalysis: boolean, includePreviousComparisons: boolean) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { text-align: center; padding: 20px; background: #f8f9fa; }
          .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
          .metric { margin: 10px 0; }
          .metric-label { font-weight: bold; color: #666; }
          .metric-value { color: #2196F3; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Analytics Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h2>Summary</h2>
          <p>This report contains detailed analytics and insights about your business performance.</p>
        </div>

        ${data.clientMetrics ? `
          <div class="section">
            <h2>Client Metrics</h2>
            <div class="metric">
              <span class="metric-label">Active Clients:</span>
              <span class="metric-value">${data.clientMetrics.engagement.weeklyActive}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Check-in Completion:</span>
              <span class="metric-value">${data.clientMetrics.engagement.checkInCompletion}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Program Adherence:</span>
              <span class="metric-value">${data.clientMetrics.progress.programAdherence}%</span>
            </div>
          </div>
        ` : ''}

        ${data.coachMetrics ? `
          <div class="section">
            <h2>Coach Metrics</h2>
            <div class="metric">
              <span class="metric-label">Client Retention:</span>
              <span class="metric-value">${data.coachMetrics.performance.clientRetention}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Average Response Time:</span>
              <span class="metric-value">${data.coachMetrics.performance.averageResponseTime} hours</span>
            </div>
            <div class="metric">
              <span class="metric-label">Client Satisfaction:</span>
              <span class="metric-value">${data.coachMetrics.performance.clientSatisfaction}%</span>
            </div>
          </div>
        ` : ''}

        ${data.businessMetrics ? `
          <div class="section">
            <h2>Business Metrics</h2>
            <div class="metric">
              <span class="metric-label">Monthly Revenue:</span>
              <span class="metric-value">$${data.businessMetrics.revenue.monthly}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Projected Annual:</span>
              <span class="metric-value">$${data.businessMetrics.revenue.projected}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Growth Rate:</span>
              <span class="metric-value">${data.businessMetrics.revenue.growth}%</span>
            </div>
          </div>
        ` : ''}

        ${includeAIAnalysis ? `
          <div class="section">
            <h2>AI Analysis</h2>
            <p>Based on the current metrics, here are some key insights:</p>
            <!-- Add AI-generated insights here -->
          </div>
        ` : ''}

        ${includePreviousComparisons ? `
          <div class="section">
            <h2>Historical Comparison</h2>
            <p>Comparison with previous periods:</p>
            <!-- Add comparison data here -->
          </div>
        ` : ''}

        <div class="footer">
          <p>Generated by Stripe Coach Analytics</p>
        </div>
      </body>
    </html>
  `;

  return new Blob([htmlContent], { type: 'text/html' });
}

async function generateDashboardReport(data: any, includeAIAnalysis: boolean, includePreviousComparisons: boolean) {
  const dashboardData = {
    title: 'Analytics Dashboard',
    generatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'summary',
        title: 'Summary',
        type: 'text',
        content: 'This dashboard provides a comprehensive view of your business performance metrics.'
      },
      ...(data.clientMetrics ? [{
        id: 'client-metrics',
        title: 'Client Metrics',
        type: 'metrics',
        metrics: [
          {
            label: 'Active Clients',
            value: data.clientMetrics.engagement.weeklyActive,
            type: 'number'
          },
          {
            label: 'Check-in Completion',
            value: data.clientMetrics.engagement.checkInCompletion,
            type: 'percentage'
          },
          {
            label: 'Program Adherence',
            value: data.clientMetrics.progress.programAdherence,
            type: 'percentage'
          }
        ]
      }] : []),
      ...(data.coachMetrics ? [{
        id: 'coach-metrics',
        title: 'Coach Metrics',
        type: 'metrics',
        metrics: [
          {
            label: 'Client Retention',
            value: data.coachMetrics.performance.clientRetention,
            type: 'percentage'
          },
          {
            label: 'Average Response Time',
            value: data.coachMetrics.performance.averageResponseTime,
            type: 'hours'
          },
          {
            label: 'Client Satisfaction',
            value: data.coachMetrics.performance.clientSatisfaction,
            type: 'percentage'
          }
        ]
      }] : []),
      ...(data.businessMetrics ? [{
        id: 'business-metrics',
        title: 'Business Metrics',
        type: 'metrics',
        metrics: [
          {
            label: 'Monthly Revenue',
            value: data.businessMetrics.revenue.monthly,
            type: 'currency'
          },
          {
            label: 'Projected Annual',
            value: data.businessMetrics.revenue.projected,
            type: 'currency'
          },
          {
            label: 'Growth Rate',
            value: data.businessMetrics.revenue.growth,
            type: 'percentage'
          }
        ]
      }] : []),
      ...(includeAIAnalysis ? [{
        id: 'ai-analysis',
        title: 'AI Analysis',
        type: 'insights',
        content: 'Based on the current metrics, here are some key insights:',
        insights: [] // To be populated with AI-generated insights
      }] : []),
      ...(includePreviousComparisons ? [{
        id: 'historical-comparison',
        title: 'Historical Comparison',
        type: 'comparison',
        content: 'Comparison with previous periods:',
        comparisons: [] // To be populated with historical data
      }] : [])
    ],
    metadata: {
      version: '1.0',
      generatedBy: 'Stripe Coach Analytics',
      lastUpdated: new Date().toISOString()
    }
  };

  return new Blob([JSON.stringify(dashboardData, null, 2)], { 
    type: 'application/json' 
  });
}

async function fetchExportData(dataType: string, filters?: Record<string, any>) {
  // Implementation of export data fetching
  return [];
}

async function convertToCSV(data: any[]) {
  if (!data.length) return new Blob([''], { type: 'text/csv' });

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ];

  return new Blob([csvRows.join('\n')], { type: 'text/csv' });
}

async function convertToExcel(data: any[]) {
  if (!data.length) {
    return new Blob([''], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Add column widths
  const colWidths = Object.keys(data[0]).map(key => ({
    wch: Math.max(key.length, 15) // Minimum width of 15 characters
  }));
  ws['!cols'] = colWidths;

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
} 