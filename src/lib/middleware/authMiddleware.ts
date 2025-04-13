import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from 'next-auth/react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function requireCoach(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getSession({ req });
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get coach document
    const coachDoc = await getDoc(doc(db, 'coaches', session.user.email));
    
    if (!coachDoc.exists()) {
      return NextResponse.json(
        { error: 'Forbidden - Coach access required' },
        { status: 403 }
      );
    }

    // Verify coach has access to this client
    if (context.params.id) {
      const clientDoc = await getDoc(doc(db, 'clients', context.params.id));
      if (!clientDoc.exists() || clientDoc.data().coachId !== session.user.email) {
        return NextResponse.json(
          { error: 'Forbidden - No access to this client' },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 