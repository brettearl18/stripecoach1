import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/config'
import { doc, updateDoc, getDoc } from 'firebase/firestore'

export async function PUT(
  request: Request,
  { params }: { params: { coachId: string; templateId: string } }
) {
  try {
    const { isDefault } = await request.json()
    const { coachId, templateId } = params

    // Update template document
    const templateRef = doc(db, 'coaches', coachId, 'templates', templateId)
    const templateDoc = await getDoc(templateRef)

    if (!templateDoc.exists()) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    await updateDoc(templateRef, {
      isDefault,
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
} 