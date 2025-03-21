import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const auth = getAuth();
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.formData();
    const formId = data.get('formId') as string;
    const responses = JSON.parse(data.get('responses') as string);
    
    // Handle photo uploads
    const photoUploads = [];
    for (const [key, value] of data.entries()) {
      if (value instanceof File) {
        const fileBuffer = await value.arrayBuffer();
        const fileName = `check-ins/${userId}/${formId}/${key}-${Date.now()}.${value.name.split('.').pop()}`;
        
        const bucket = adminStorage.bucket();
        const file = bucket.file(fileName);
        await file.save(Buffer.from(fileBuffer));
        
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2500' // Long-lived URL
        });
        
        photoUploads.push({ questionId: key, url });
      }
    }

    // Save check-in data to Firestore
    const checkInRef = adminDb.collection('check-ins').doc();
    await checkInRef.set({
      id: checkInRef.id,
      userId,
      formId,
      responses,
      photos: Object.fromEntries(photoUploads.map(({ questionId, url }) => [questionId, url])),
      createdAt: new Date().toISOString(),
      status: 'submitted'
    });

    // Update user's last check-in date
    await adminDb.collection('users').doc(userId).set({
      lastCheckIn: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({
      success: true,
      checkInId: checkInRef.id
    });
  } catch (error) {
    console.error('Error submitting check-in:', error);
    return NextResponse.json(
      { error: 'Failed to submit check-in' },
      { status: 500 }
    );
  }
} 