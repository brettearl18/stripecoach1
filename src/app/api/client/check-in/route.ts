import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export async function GET(request: Request) {
  try {
    // Get the session cookie
    const session = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the session
    const decodedToken = await getAuth().verifySessionCookie(session);
    const userId = decodedToken.uid;

    // Get user's check-in data from Firestore
    const checkInsRef = db.collection('users').doc(userId).collection('checkIns');
    const checkInsSnapshot = await checkInsRef.orderBy('date', 'desc').limit(10).get();

    const checkIns = checkInsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate metrics
    const latestCheckIn = checkIns[0];
    const metrics = {
      latestScore: latestCheckIn?.overallScore || 0,
      totalCheckIns: checkIns.length,
      nextCheckIn: calculateNextCheckIn(latestCheckIn?.date)
    };

    return NextResponse.json({
      checkIns,
      metrics
    });
  } catch (error) {
    console.error('Error fetching check-in data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-in data' },
      { status: 500 }
    );
  }
}

function calculateNextCheckIn(lastCheckInDate: string | undefined): string {
  if (!lastCheckInDate) return 'Today';
  
  const lastCheck = new Date(lastCheckInDate);
  const today = new Date();
  const daysSinceLastCheck = Math.floor((today.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastCheck < 7) {
    const daysUntilNext = 7 - daysSinceLastCheck;
    return `In ${daysUntilNext} ${daysUntilNext === 1 ? 'day' : 'days'}`;
  }
  
  return 'Today';
}

export async function POST(request: Request) {
  try {
    const session = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await getAuth().verifySessionCookie(session);
    const userId = decodedToken.uid;
    const data = await request.json();

    // Validate required fields
    if (!data.templateId || !data.answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate scores and metrics
    const scores = calculateScores(data.answers);
    const overallScore = calculateOverallScore(scores);

    // Create check-in document
    const checkInData = {
      templateId: data.templateId,
      answers: data.answers,
      scores,
      overallScore,
      date: new Date().toISOString(),
      status: 'completed'
    };

    // Save to Firestore
    const checkInsRef = db.collection('users').doc(userId).collection('checkIns');
    const docRef = await checkInsRef.add(checkInData);

    return NextResponse.json({
      id: docRef.id,
      ...checkInData
    });
  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json(
      { error: 'Failed to create check-in' },
      { status: 500 }
    );
  }
}

function calculateScores(answers: any): Record<string, number> {
  // Implement score calculation logic based on answers
  // This is a placeholder implementation
  return {
    nutrition: calculateCategoryScore(answers.nutrition),
    training: calculateCategoryScore(answers.training),
    mindset: calculateCategoryScore(answers.mindset),
    sleep: calculateCategoryScore(answers.sleep)
  };
}

function calculateCategoryScore(answers: any): number {
  // Implement category-specific score calculation
  // This is a placeholder implementation
  return Math.floor(Math.random() * 30) + 70; // Random score between 70-100
}

function calculateOverallScore(scores: Record<string, number>): number {
  const values = Object.values(scores);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
} 