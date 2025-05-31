'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AlertService, Alert, AlertType } from '@/lib/services/alertService'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Bell, 
  AlertTriangle, 
  Clock, 
  Target, 
  Activity, 
  UserX,
  MessageCircle,
  CheckCircle,
  XCircle,
  History
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { getPriorityAlerts } from '@/lib/firebase/coachAnalytics'
import { ExclamationCircleIcon, CheckCircleIcon, PhoneIcon } from '@heroicons/react/24/outline'

// Mock data
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'concerning_response',
    priority: 'high',
    clientId: 'client1',
    clientName: 'Michael Chen',
    message: 'Reported high stress levels and decreased sleep quality',
    createdAt: new Date().toISOString(),
    status: 'active'
  },
  {
    id: '2',
    type: 'missed_checkin',
    priority: 'medium',
    clientId: 'client2',
    clientName: 'Emma Davis',
    message: 'Missed last 2 check-ins - no response to follow-up',
    createdAt: new Date().toISOString(),
    status: 'active'
  },
  {
    id: '3',
    type: 'rapid_change',
    priority: 'high',
    clientId: 'client3',
    clientName: 'James Thompson',
    message: 'Sudden 2kg weight increase in past week',
    createdAt: new Date().toISOString(),
    status: 'active'
  }
];

export function PriorityAlerts() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showResolved, setShowResolved] = useState(false)

  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      getPriorityAlerts(user.uid)
        .then(setAlerts)
        .finally(() => setLoading(false));
    }
  }, [user?.uid]);

  const handleDismiss = async (alertId: string) => {
    try {
      // In a real app, this would update the alert status to 'dismissed' in the backend
      setAlerts(alerts.filter(alert => alert.id !== alertId))
      toast.success('Alert dismissed - Will not show again')
    } catch (error) {
      console.error('Error dismissing alert:', error)
      toast.error('Failed to dismiss alert')
    }
  }

  const handleResolve = async (alertId: string) => {
    try {
      // In a real app, this would:
      // 1. Update the alert status to 'resolved' in the backend
      // 2. Log the resolution action for tracking
      // 3. Optionally trigger any follow-up workflows
      setAlerts(alerts.filter(alert => alert.id !== alertId))
      toast.success('Alert resolved and logged')
    } catch (error) {
      console.error('Error resolving alert:', error)
      toast.error('Failed to resolve alert')
    }
  }

  const handleContact = (clientId: string, clientName: string, alertType: AlertType) => {
    // In a real app, this would:
    // 1. Open the messaging interface
    // 2. Pre-populate a message template based on the alert type
    // 3. Log the contact attempt
    toast.success(`Opening message composer for ${clientName}`)
  }

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'missed_checkin':
        return <Bell className="w-5 h-5 text-orange-500" />
      case 'concerning_response':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'rapid_change':
        return <Activity className="w-5 h-5 text-purple-500" />
      case 'low_engagement':
        return <UserX className="w-5 h-5 text-blue-500" />
      case 'upcoming_deadline':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'goal_milestone':
        return <Target className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getPriorityBadge = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>
      case 'medium':
        return <Badge variant="warning">Medium Priority</Badge>
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>
      default:
        return <Badge variant="outline">Priority</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!alerts.length) return <div className="py-4 text-center text-muted-foreground">No priority alerts.</div>;

  const getBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
              Priority Alerts
            </h2>
            <p className="text-sm text-muted-foreground">
              Important notifications that need your attention
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            {showResolved ? 'Hide Resolved' : 'Show Resolved'}
          </Button>
        </div>
        
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-lg bg-background/50 border border-border/50 hover:bg-background/80 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getAlertIcon(alert.type as AlertType)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/coach/clients/${alert.clientId}`}
                        className="font-medium hover:underline"
                      >
                        {alert.clientName}
                      </Link>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${getBadgeColor(alert.priority || 'high')}`}>
                        {alert.priority ? `${alert.priority} Priority` : 'Alert'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(alert.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Dismiss
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleContact(alert.clientId, alert.clientName, alert.type as AlertType)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <PhoneIcon className="w-4 h-4 mr-1" />
                  Contact
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleResolve(alert.id)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Resolve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 