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
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showResolved, setShowResolved] = useState(false)

  useEffect(() => {
    // Simulate API call with mock data
    const loadMockAlerts = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAlerts(mockAlerts);
      setLoading(false);
    };
    loadMockAlerts();
  }, []);

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

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" />
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
          {alerts.length === 0 ? (
            <div className="flex items-center justify-center h-[180px]">
              <div className="text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No active alerts</p>
              </div>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-lg bg-background/50 border border-border/50 hover:bg-background/80 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getAlertIcon(alert.type)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/coach/clients/${alert.clientId}`}
                          className="font-medium hover:underline"
                        >
                          {alert.clientName}
                        </Link>
                        {getPriorityBadge(alert.priority)}
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
                    onClick={() => handleContact(alert.clientId, alert.clientName, alert.type)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Contact
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleResolve(alert.id)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resolve
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 