import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { CoachProfile } from '@/types/coach';

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

    // Get user's coach profile from Firestore
    const coachRef = db.collection('users').doc(userId);
    const coachDoc = await coachRef.get();

    if (!coachDoc.exists) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }

    const coachData = coachDoc.data() as CoachProfile;

    // Get coach's testimonials
    const testimonialsSnapshot = await coachRef.collection('testimonials').get();
    coachData.testimonials = testimonialsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get coach's packages
    const packagesSnapshot = await coachRef.collection('packages').get();
    coachData.packages = packagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(coachData);
  } catch (error) {
    console.error('Error fetching coach profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coach profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await getAuth().verifySessionCookie(session);
    const userId = decodedToken.uid;
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.title || !data.bio) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update coach profile
    const coachRef = db.collection('users').doc(userId);
    await coachRef.update({
      name: data.name,
      title: data.title,
      bio: data.bio,
      specialties: data.specialties || [],
      expertise: data.expertise || [],
      certifications: data.certifications || [],
      availability: data.availability || {},
      socialLinks: data.socialLinks || [],
      contactInfo: data.contactInfo || {},
      stats: data.stats || {},
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating coach profile:', error);
    return NextResponse.json(
      { error: 'Failed to update coach profile' },
      { status: 500 }
    );
  }
} 