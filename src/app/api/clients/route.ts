import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase/firebase-client';
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { clientData } = await req.json();
  const newDoc = doc(collection(db, 'clients'));
  await setDoc(newDoc, {
    ...clientData,
    coachId: session.user.id,
    createdAt: new Date(),
  });
  return NextResponse.json({ success: true, id: newDoc.id });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const q = query(collection(db, 'clients'), where('coachId', '==', session.user.id));
  const snapshot = await getDocs(q);
  const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ clients });
} 