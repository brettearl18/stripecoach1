import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { CoachFeedback, FeedbackCategory } from '@/types/feedback';

const db = getFirestore();

// GET /api/feedback - Get all feedback for a client or coach
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const coachId = searchParams.get('coachId');
    const category = searchParams.get('category') as FeedbackCategory;

    // Get the session cookie
    const session = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the session
    const decodedToken = await getAuth().verifySessionCookie(session);
    const userId = decodedToken.uid;

    // Build query based on parameters
    let query = db.collection('feedback');
    
    if (clientId) {
      query = query.where('clientId', '==', clientId);
    }
    
    if (coachId) {
      query = query.where('coachId', '==', coachId);
    }
    
    if (category) {
      query = query.where('category', '==', category);
    }

    // Execute query
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    const feedbacks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// POST /api/feedback - Create new feedback
export async function POST(request: Request) {
  try {
    const session = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await getAuth().verifySessionCookie(session);
    const coachId = decodedToken.uid;
    
    const data = await request.json();

    // Validate required fields
    if (!data.clientId || !data.category || !data.title || !data.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new feedback document
    const feedback: Omit<CoachFeedback, 'id'> = {
      clientId: data.clientId,
      coachId,
      category: data.category,
      title: data.title,
      content: data.content,
      metric: data.metric,
      suggestions: data.suggestions || [],
      audioMessages: data.audioMessages || [],
      attachments: data.attachments || [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('feedback').add(feedback);

    return NextResponse.json({
      id: docRef.id,
      ...feedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
} 