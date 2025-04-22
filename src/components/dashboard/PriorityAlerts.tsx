'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AlertService, Alert, AlertType } from '@/lib/services/alertService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Bell, AlertTriangle, Clock, Target, Activity, UserX } from 'lucide-react'
import { toast } from 'sonner'

export function PriorityAlerts() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.uid) {
      loadAlerts()
    }
  }, [user?.uid])

  const loadAlerts = async () => {
    try {
      const activeAlerts = await AlertService.getActiveAlerts(user!.uid)
      setAlerts(activeAlerts)
    } catch (error) {
      console.error('Error loading alerts:', error)
      toast.error('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async (alertId: string) => {
    try {
      await AlertService.dismissAlert(user!.uid, alertId)
      setAlerts(alerts.filter(alert => alert.id !== alertId))
      toast.success('Alert dismissed')
    } catch (error) {
      console.error('Error dismissing alert:', error)
      toast.error('Failed to dismiss alert')
    }
  }

  const handleResolve = async (alertId: string) => {
    try {
      await AlertService.resolveAlert(user!.uid, alertId)
      setAlerts(alerts.filter(alert => alert.id !== alertId))
      toast.success('Alert resolved')
    } catch (error) {
      console.error('Error resolving alert:', error)
      toast.error('Failed to resolve alert')
    }
  }

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'missed_checkin':
        return <Bell className="w-5 h-5" />
      case 'concerning_response':
        return <AlertTriangle className="w-5 h-5" />
      case 'rapid_change':
        return <Activity className="w-5 h-5" />
      case 'low_engagement':
        return <UserX className="w-5 h-5" />
      case 'upcoming_deadline':
        return <Clock className="w-5 h-5" />
      case 'goal_milestone':
        return <Target className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Priority Alerts
        </h2>
        <p className="text-sm text-muted-foreground">
          Important notifications that need your attention
        </p>
        
        <div className="mt-4 flex items-center justify-center h-[180px]">
          <div className="text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No active alerts</p>
          </div>
        </div>
      </div>
    </div>
  )
} 