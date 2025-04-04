import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { ClientFeedbackResponse } from '@/types/feedback';

const db = getFirestore();

// POST /api/feedback/[id]/response - Submit a response to feedback
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const feedbackId = params.id;
    const session = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await getAuth().verifySessionCookie(session);
    const clientId = decodedToken.uid;
    
    const data = await request.json();

    // Validate required fields
    if (typeof data.isAgreed !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the feedback document
    const feedbackRef = db.collection('feedback').doc(feedbackId);
    const feedbackDoc = await feedbackRef.get();

    if (!feedbackDoc.exists) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Create response document
    const response: Omit<ClientFeedbackResponse, 'id'> = {
      feedbackId,
      clientId,
      content: data.content,
      audioMessage: data.audioMessage,
      attachments: data.attachments || [],
      isAgreed: data.isAgreed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add response to feedback document
    const responseRef = await feedbackRef.collection('responses').add(response);

    // Update feedback status if agreed
    if (data.isAgreed) {
      await feedbackRef.update({
        status: 'completed',
        updatedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({
      id: responseRef.id,
      ...response
    });
  } catch (error) {
    console.error('Error submitting feedback response:', error);
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    );
  }
}

// GET /api/feedback/[id]/response - Get responses for a feedback
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const feedbackId = params.id;
    const session = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await getAuth().verifySessionCookie(session);

    // Get all responses for the feedback
    const responsesSnapshot = await db
      .collection('feedback')
      .doc(feedbackId)
      .collection('responses')
      .orderBy('createdAt', 'desc')
      .get();

    const responses = responsesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error fetching feedback responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
} 