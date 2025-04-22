import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'

export async function GET(
  request: Request,
  { params }: { params: { coachId: string } }
) {
  try {
    const { coachId } = params

    // Get all templates for the coach
    const templatesRef = collection(db, 'coaches', coachId, 'templates')
    const templatesSnapshot = await getDocs(templatesRef)

    const templates = templatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
} 