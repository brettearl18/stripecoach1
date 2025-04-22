import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import { AlertService } from '@/lib/services/alertService'

// This endpoint should be called by a cron job every hour
export async function GET() {
  try {
    // Get all coaches
    const coachesRef = collection(db, 'coaches')
    const coachesSnapshot = await getDocs(coachesRef)
    
    // Generate alerts for each coach
    await Promise.all(coachesSnapshot.docs.map(async (doc) => {
      const coachId = doc.id
      
      // Generate different types of alerts
      await Promise.all([
        AlertService.generateMissedCheckinAlerts(coachId),
        AlertService.generateConcerningResponseAlerts(coachId),
        AlertService.generateRapidChangeAlerts(coachId),
        AlertService.generateLowEngagementAlerts(coachId),
        AlertService.generateUpcomingDeadlineAlerts(coachId),
        AlertService.generateGoalMilestoneAlerts(coachId)
      ])
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error generating alerts:', error)
    return NextResponse.json(
      { error: 'Failed to generate alerts' },
      { status: 500 }
    )
  }
} 