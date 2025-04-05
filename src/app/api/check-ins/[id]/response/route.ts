import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const db = getFirestore();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const checkInId = params.id;
    const session = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the session and get the coach's ID
    const decodedToken = await getAuth().verifySessionCookie(session);
    const coachId = decodedToken.uid;

    // Get the request body
    const data = await request.json();
    const { type, text, audioMessage } = data;

    if (!type || (type === 'text' && !text) || (type === 'audio' && !audioMessage)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the check-in document
    const checkInRef = db.collection('check-ins').doc(checkInId);
    const checkInDoc = await checkInRef.get();

    if (!checkInDoc.exists) {
      return NextResponse.json(
        { error: 'Check-in not found' },
        { status: 404 }
      );
    }

    const checkInData = checkInDoc.data();

    // Verify that this coach is assigned to this client
    if (checkInData?.coachId !== coachId) {
      return NextResponse.json(
        { error: 'Not authorized to respond to this check-in' },
        { status: 403 }
      );
    }

    // Create the response object
    const response = {
      type,
      text,
      audioMessage,
      coachId,
      createdAt: new Date().toISOString(),
    };

    // Add the response to the check-in document
    await checkInRef.update({
      coachResponse: response,
      status: 'reviewed',
      updatedAt: new Date().toISOString()
    });

    // Send notification to client (implement this later)
    // await sendNotification(checkInData.clientId, 'Your coach has responded to your check-in');

    return NextResponse.json({
      message: 'Response submitted successfully',
      response
    });
  } catch (error) {
    console.error('Error submitting check-in response:', error);
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const checkInId = params.id;
    const session = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the session
    await getAuth().verifySessionCookie(session);

    // Get the check-in document
    const checkInRef = db.collection('check-ins').doc(checkInId);
    const checkInDoc = await checkInRef.get();

    if (!checkInDoc.exists) {
      return NextResponse.json(
        { error: 'Check-in not found' },
        { status: 404 }
      );
    }

    const checkInData = checkInDoc.data();
    return NextResponse.json({
      coachResponse: checkInData?.coachResponse || null
    });
  } catch (error) {
    console.error('Error fetching check-in response:', error);
    return NextResponse.json(
      { error: 'Failed to fetch response' },
      { status: 500 }
    );
  }
} 