'use client';

import { useState } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  BoltIcon,
  SparklesIcon,
  HeartIcon,
  BanknotesIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';

interface Insight {
  id: string;
  type: 'trend' | 'prediction' | 'alert' | 'recommendation';
  title: string;
  description: string;
  metric?: string;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  confidence?: number;
  action?: {
    text: string;
    href: string;
  };
}

const sampleInsights: Insight[] = [
  {
    id: '1',
    type: 'trend',
    title: 'Client Engagement Patterns',
    description: 'Clients are most active on Monday mornings and Wednesday evenings. Consider scheduling check-ins during these peak engagement times.',
    metric: '78% response rate',
    trend: 'up',
    confidence: 0.92
  },
  {
    id: '2',
    type: 'prediction',
    title: 'Revenue Forecast',
    description: 'Based on current growth and retention rates, projected revenue for next quarter is $5,800',
    metric: '+38% growth',
    trend: 'up',
    confidence: 0.85,
    action: {
      text: 'View detailed forecast',
      href: '/admin/analytics'
    }
  },
  {
    id: '3',
    type: 'alert',
    title: 'Retention Risk',
    description: '3 clients showing decreased engagement in the past 2 weeks. Early intervention recommended.',
    metric: '3 clients',
    trend: 'down',
    action: {
      text: 'View at-risk clients',
      href: '/admin/clients'
    }
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'Program Optimization',
    description: 'Clients in the "Weight Management" program show 32% better results when including weekly progress photos.',
    confidence: 0.89,
    action: {
      text: 'Adjust program templates',
      href: '/admin/programs'
    }
  }
];

export default function AIInsights() {
  const [insights, setInsights] = useState(sampleInsights);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <ChartBarIcon className="h-5 w-5 text-blue-500" />;
      case 'prediction':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'alert':
        return <BoltIcon className="h-5 w-5 text-red-500" />;
      case 'recommendation':
        return <SparklesIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <ChartPieIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend':
        return 'bg-blue-50 border-blue-200';
      case 'prediction':
        return 'bg-green-50 border-green-200';
      case 'alert':
        return 'bg-red-50 border-red-200';
      case 'recommendation':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">AI Insights</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Powered by</span>
            <SparklesIcon className="h-5 w-5 text-indigo-500" />
            <span className="font-medium text-indigo-600">Coach AI</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border shadow-sm ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getInsightIcon(insight.type)}
                  <h3 className="text-sm font-medium text-gray-900">{insight.title}</h3>
                </div>
                {insight.confidence && (
                  <span className="text-xs text-gray-500">
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-gray-600">{insight.description}</p>

              {(insight.metric || insight.trend) && (
                <div className="mt-3 flex items-center space-x-3">
                  {insight.metric && (
                    <span className="text-sm font-medium text-gray-900">
                      {insight.metric}
                    </span>
                  )}
                  {insight.trend && (
                    <span className={`flex items-center text-sm ${
                      insight.trend === 'up' ? 'text-green-600' :
                      insight.trend === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {insight.trend === 'up' ? '↑' : insight.trend === 'down' ? '↓' : '→'}
                      {insight.change}
                    </span>
                  )}
                </div>
              )}

              {insight.action && (
                <div className="mt-3">
                  <a
                    href={insight.action.href}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    {insight.action.text} →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Business Health Score</h3>
                <p className="text-indigo-100">Based on 15 key performance indicators</p>
              </div>
              <div className="text-3xl font-bold">87/100</div>
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 mx-auto bg-white/20 rounded-full">
                  <HeartIcon className="h-6 w-6" />
                </div>
                <div className="mt-2">
                  <div className="text-sm font-medium">Client Health</div>
                  <div className="text-xl font-semibold">92%</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 mx-auto bg-white/20 rounded-full">
                  <BanknotesIcon className="h-6 w-6" />
                </div>
                <div className="mt-2">
                  <div className="text-sm font-medium">Financial Health</div>
                  <div className="text-xl font-semibold">85%</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 mx-auto bg-white/20 rounded-full">
                  <UserGroupIcon className="h-6 w-6" />
                </div>
                <div className="mt-2">
                  <div className="text-sm font-medium">Growth Health</div>
                  <div className="text-xl font-semibold">83%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Future Projections</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expected Client Growth (3 months)</span>
                <span className="text-sm font-medium text-green-600">+8 clients</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue Growth Trajectory</span>
                <span className="text-sm font-medium text-green-600">+42% YoY</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Projected Retention Rate</span>
                <span className="text-sm font-medium text-blue-600">93%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}