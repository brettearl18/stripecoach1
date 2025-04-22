import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'

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

  useEffect(() => {
    if (user?.uid) {
      loadAnalytics()
    }
  }, [user?.uid])

  const loadAnalytics = async () => {
    try {
      // In a real implementation, fetch data from your backend
      // For now, using mock data
      setMetrics([
        {
          label: 'Active Clients',
          value: 25,
          change: 3,
          trend: 'up',
          icon: UserGroupIcon
        },
        {
          label: 'Weekly Engagement',
          value: '85%',
          change: 5,
          trend: 'up',
          icon: ChartBarIcon
        },
        {
          label: 'Client Progress',
          value: '78%',
          change: -2,
          trend: 'down',
          icon: ArrowTrendingUpIcon
        },
        {
          label: 'Check-in Completion',
          value: '92%',
          change: 8,
          trend: 'up',
          icon: ClipboardDocumentCheckIcon
        }
      ])
    } catch (error) {
      console.error('Error loading analytics:', error)
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
          <div className="p-4 rounded-lg bg-background/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Active Clients</p>
              <span className="text-sm text-green-600 bg-green-100 px-2 py-0.5 rounded">+3%</span>
            </div>
            <p className="text-2xl font-bold mt-2">25</p>
          </div>
          
          <div className="p-4 rounded-lg bg-background/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Weekly Engagement</p>
              <span className="text-sm text-green-600 bg-green-100 px-2 py-0.5 rounded">+5%</span>
            </div>
            <p className="text-2xl font-bold mt-2">85%</p>
          </div>
          
          <div className="p-4 rounded-lg bg-background/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Client Progress</p>
              <span className="text-sm text-red-600 bg-red-100 px-2 py-0.5 rounded">-2%</span>
            </div>
            <p className="text-2xl font-bold mt-2">78%</p>
          </div>
          
          <div className="p-4 rounded-lg bg-background/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Check-in Completion</p>
              <span className="text-sm text-green-600 bg-green-100 px-2 py-0.5 rounded">+8%</span>
            </div>
            <p className="text-2xl font-bold mt-2">92%</p>
          </div>
        </div>
      </div>
    </div>
  )
} 