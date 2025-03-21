import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

function generateAIAnalysis(data: any) {
  const { weightProgress, healthMetrics, goals } = data;
  
  // Calculate overall progress score
  const weightScore = (weightProgress.percentageComplete / 100) * 10;
  const healthScore = (
    (parseFloat(healthMetrics.sleep.change) + 
    parseFloat(healthMetrics.energy.change) + 
    Math.abs(parseFloat(healthMetrics.stress.change))) / 3
  ) * 10;
  const goalsScore = (goals.percentage / 100) * 10;
  
  const overallScore = ((weightScore + healthScore + goalsScore) / 3).toFixed(1);

  // Generate personalized insights
  const insights = {
    overview: `Based on comprehensive analysis of your progress data, you have achieved an overall success score of ${overallScore}/10. ${
      overallScore >= 7 ? 'This is excellent progress!' :
      overallScore >= 5 ? 'You are making steady progress.' :
      'There is room for improvement, but you are on the right track.'
    }`,
    
    weightAnalysis: `Your weight loss journey shows ${
      weightProgress.change <= -10 ? 'remarkable' :
      weightProgress.change <= -5 ? 'good' :
      'steady'
    } progress. You have lost ${Math.abs(weightProgress.change)} lbs, which is ${
      weightProgress.percentageComplete >= 80 ? 'exceptional' :
      weightProgress.percentageComplete >= 50 ? 'solid' :
      'a good start towards'
    } progress toward your goal.`,
    
    healthInsights: `Your health metrics indicate ${
      healthScore >= 8 ? 'outstanding' :
      healthScore >= 6 ? 'positive' :
      'improving'
    } overall wellness. Sleep quality has ${
      parseFloat(healthMetrics.sleep.change) > 20 ? 'significantly improved' :
      parseFloat(healthMetrics.sleep.change) > 0 ? 'shown improvement' :
      'remained stable'
    }, while energy levels have ${
      parseFloat(healthMetrics.energy.change) > 20 ? 'increased substantially' :
      parseFloat(healthMetrics.energy.change) > 0 ? 'improved' :
      'maintained consistency'
    }.`,
    
    recommendations: [
      weightProgress.percentageComplete < 50 ? 
        'Consider increasing workout intensity gradually to accelerate progress' : 
        'Maintain current exercise routine while focusing on form and consistency',
      parseFloat(healthMetrics.sleep.change) < 15 ?
        'Implement a consistent bedtime routine to improve sleep quality' :
        'Continue your effective sleep habits',
      goals.percentage < 70 ?
        'Break down remaining goals into smaller, achievable milestones' :
        'Set new challenging goals while maintaining current achievements',
    ],
    
    nextSteps: `Focus areas for the next phase:
1. ${weightProgress.percentageComplete < 100 ? 
     `Continue working towards your target weight of ${weightProgress.initial - 15} lbs` :
     'Maintain your achieved weight while building lean muscle'}
2. ${healthMetrics.sleep.current < 8 ?
     'Improve sleep quality to reach optimal 8 hours per night' :
     'Maintain excellent sleep habits'}
3. ${goals.percentage < 100 ?
     `Complete remaining ${goals.total - goals.completed} goals` :
     'Set new challenging goals for continued progress'}`
  };

  return insights;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { clientInfo, measurements, weightProgress, healthMetrics, goals } = data;

    // Generate AI insights
    const aiInsights = generateAIAnalysis(data);

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Progress Report - ${clientInfo.name}`,
        Author: 'Stripe Coach',
      },
    });

    // Convert the PDF to a buffer
    const chunks: any[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    
    // Create a promise that resolves when the PDF is done
    const pdfBuffer = new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    // Add header with logo placeholder
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Progress Report', { align: 'center' })
      .moveDown();

    // Add AI Overview section
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('AI Analysis Overview', { color: '#4F46E5' })
      .moveDown(0.5)
      .fontSize(12)
      .font('Helvetica')
      .text(aiInsights.overview)
      .moveDown();

    // Add client info
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Client Information')
      .moveDown(0.5)
      .fontSize(12)
      .font('Helvetica')
      .text(`Name: ${clientInfo.name}`)
      .text(`Email: ${clientInfo.email}`)
      .text(`Status: ${clientInfo.status}`)
      .moveDown();

    // Add weight progress section with AI analysis
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Weight Progress Analysis')
      .moveDown(0.5)
      .fontSize(12)
      .font('Helvetica')
      .text(`Starting Weight: ${weightProgress.initial} lbs`)
      .text(`Current Weight: ${weightProgress.current} lbs`)
      .text(`Total Change: ${weightProgress.change} lbs`)
      .text(`Progress to Goal: ${weightProgress.percentageComplete.toFixed(1)}%`)
      .moveDown(0.5)
      .text(aiInsights.weightAnalysis)
      .moveDown();

    // Add health insights section
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Health & Wellness Analysis')
      .moveDown(0.5)
      .fontSize(12)
      .font('Helvetica')
      .text(aiInsights.healthInsights)
      .moveDown();

    // Add AI recommendations
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('AI-Generated Recommendations')
      .moveDown(0.5)
      .fontSize(12)
      .font('Helvetica');

    aiInsights.recommendations.forEach((rec, index) => {
      doc.text(`${index + 1}. ${rec}`);
    });
    doc.moveDown();

    // Add next steps section
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Personalized Next Steps')
      .moveDown(0.5)
      .fontSize(12)
      .font('Helvetica')
      .text(aiInsights.nextSteps)
      .moveDown();

    // Add measurements section
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Body Measurements Progress')
      .moveDown(0.5)
      .fontSize(12)
      .font('Helvetica');

    Object.entries(measurements.changes).forEach(([key, data]: [string, any]) => {
      const change = data.value > 0 ? `+${data.value}` : data.value;
      doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${change} ${data.unit}`);
    });
    doc.moveDown();

    // Add footer
    doc
      .fontSize(10)
      .text(
        `Report generated on ${new Date().toLocaleDateString()} by Stripe Coach AI`,
        { align: 'center' }
      );

    // Finalize the PDF
    doc.end();

    // Wait for the PDF buffer
    const buffer = await pdfBuffer;

    // Return the PDF as a response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${clientInfo.name.replace(' ', '_')}_progress_report.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
} 