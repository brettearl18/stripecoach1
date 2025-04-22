import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore'

export type AlertPriority = 'high' | 'medium' | 'low'
export type AlertStatus = 'active' | 'dismissed' | 'resolved'
export type AlertType = 
  | 'missed_checkin'
  | 'concerning_response'
  | 'rapid_change'
  | 'low_engagement'
  | 'upcoming_deadline'
  | 'goal_milestone'

export interface Alert {
  id: string
  type: AlertType
  priority: AlertPriority
  status: AlertStatus
  clientId: string
  clientName: string
  message: string
  details?: any
  createdAt: Timestamp
  updatedAt: Timestamp
  dismissedAt?: Timestamp
  resolvedAt?: Timestamp
}

export class AlertService {
  static async getActiveAlerts(coachId: string): Promise<Alert[]> {
    const alertsRef = collection(db, 'coaches', coachId, 'alerts')
    const q = query(
      alertsRef,
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Alert[]
  }

  static async generateMissedCheckinAlerts(coachId: string) {
    const checkInsRef = collection(db, 'coaches', coachId, 'checkIns')
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Find check-ins that are more than 24 hours late
    const q = query(
      checkInsRef,
      where('status', '==', 'pending'),
      where('dueDate', '<', yesterday)
    )

    const snapshot = await getDocs(q)
    const alerts = snapshot.docs.map(doc => {
      const checkIn = doc.data()
      return {
        type: 'missed_checkin' as AlertType,
        priority: 'high' as AlertPriority,
        status: 'active' as AlertStatus,
        clientId: checkIn.clientId,
        clientName: checkIn.clientName,
        message: `${checkIn.clientName} has missed their scheduled check-in`,
        details: {
          checkInId: doc.id,
          dueDate: checkIn.dueDate,
          templateName: checkIn.templateName
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    })

    // Create alerts in Firestore
    const alertsRef = collection(db, 'coaches', coachId, 'alerts')
    await Promise.all(
      alerts.map(alert => addAlert(coachId, alert))
    )
  }

  static async generateConcerningResponseAlerts(coachId: string) {
    // Implement logic to detect concerning responses
    // This could include analyzing check-in responses against predefined thresholds
  }

  static async generateRapidChangeAlerts(coachId: string) {
    // Implement logic to detect rapid changes in measurements/metrics
    // This could include comparing current values with historical data
  }

  static async generateLowEngagementAlerts(coachId: string) {
    // Implement logic to detect low engagement patterns
    // This could include analyzing check-in completion rates and response times
  }

  static async generateUpcomingDeadlineAlerts(coachId: string) {
    // Implement logic to detect upcoming deadlines
    // This could include checking for check-ins due in the next 24 hours
  }

  static async generateGoalMilestoneAlerts(coachId: string) {
    // Implement logic to detect goal milestones
    // This could include analyzing progress towards client goals
  }

  static async addAlert(coachId: string, alert: Omit<Alert, 'id'>) {
    const alertsRef = collection(db, 'coaches', coachId, 'alerts')
    await addDoc(alertsRef, alert)
  }

  static async dismissAlert(coachId: string, alertId: string) {
    const alertRef = doc(db, 'coaches', coachId, 'alerts', alertId)
    await updateDoc(alertRef, {
      status: 'dismissed',
      dismissedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
  }

  static async resolveAlert(coachId: string, alertId: string) {
    const alertRef = doc(db, 'coaches', coachId, 'alerts', alertId)
    await updateDoc(alertRef, {
      status: 'resolved',
      resolvedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
  }

  // Helper function to determine alert priority based on type and context
  static determineAlertPriority(type: AlertType, context: any): AlertPriority {
    switch (type) {
      case 'missed_checkin':
        const hoursSinceDue = (Date.now() - context.dueDate.toMillis()) / (1000 * 60 * 60)
        return hoursSinceDue > 48 ? 'high' : hoursSinceDue > 24 ? 'medium' : 'low'
      
      case 'concerning_response':
        return context.severity === 'critical' ? 'high' : 'medium'
      
      case 'rapid_change':
        return context.percentageChange > 20 ? 'high' : 'medium'
      
      case 'low_engagement':
        return context.daysInactive > 7 ? 'high' : 'medium'
      
      case 'upcoming_deadline':
        return context.hoursUntilDue < 12 ? 'high' : 'medium'
      
      case 'goal_milestone':
        return 'medium'
      
      default:
        return 'low'
    }
  }
} 