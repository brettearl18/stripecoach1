import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { getActiveClients, getRecentCheckIns, getAverageClientProgress } from '@/lib/firebase/coachAnalytics'

interface AnalyticMetric {
  label: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  icon: React.ElementType
}

export function AnalyticsSnapshot() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<AnalyticMetric[]>([
    {
      label: 'Active Clients',
      value: 0,
      icon: UserGroupIcon
    },
    {
      label: 'Weekly Engagement',
      value: '0%',
      icon: ChartBarIcon
    },
    {
      label: 'Client Progress',
      value: '0%',
      icon: ArrowTrendingUpIcon
    },
    {
      label: 'Check-in Completion',
      value: '0%',
      icon: ClipboardDocumentCheckIcon
    }
  ])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.uid) {
      loadAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const coachId = user.uid
      const clients = await getActiveClients(coachId)
      const activeClients = clients.length
      const checkIns = await getRecentCheckIns(coachId)
      const engagedClients = new Set(checkIns.map(ci => ci.clientId))
      const weeklyEngagement = activeClients ? Math.round((engagedClients.size / activeClients) * 100) : 0
      const avgProgress = await getAverageClientProgress(coachId)
      const completedCheckIns = checkIns.filter(ci => ci.completed).length
      const checkInCompletion = checkIns.length ? Math.round((completedCheckIns / checkIns.length) * 100) : 0

      setMetrics([
        {
          label: 'Active Clients',
          value: activeClients,
          icon: UserGroupIcon
        },
        {
          label: 'Weekly Engagement',
          value: `${weeklyEngagement}%`,
          icon: ChartBarIcon
        },
        {
          label: 'Client Progress',
          value: `${avgProgress}%`,
          icon: ArrowTrendingUpIcon
        },
        {
          label: 'Check-in Completion',
          value: `${checkInCompletion}%`,
          icon: ClipboardDocumentCheckIcon
        }
      ])
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTrendIndicator = (change?: number, trend?: 'up' | 'down' | 'stable') => {
    if (!change || !trend) return null

    const color = getTrendColor(trend)
    const prefix = trend === 'up' ? '+' : ''

    return (
      <span className={`${color} text-sm font-medium ml-2`}>
        {prefix}{change}%
      </span>
    )
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5" />
          Analytics Snapshot
        </h2>
        <p className="text-sm text-muted-foreground">
          Key metrics and insights from your coaching business
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <div key={metric.label} className="p-4 rounded-lg bg-background/50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{metric.label}</p>
              </div>
              <p className="text-2xl font-bold mt-2">{metric.value}</p>
            </div>
          ))}
        </div>
        {loading && <div className="mt-4 text-sm text-muted-foreground">Loading analytics...</div>}
      </div>
    </div>
  )
} 