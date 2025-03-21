'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  HeartIcon,
  MoonIcon,
  EyeIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { checkIns } from '@/data/checkIns';

export default function CheckInsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);

  const filteredCheckIns = selectedStatus === 'all'
    ? checkIns
    : checkIns.filter(checkIn => checkIn.status === selectedStatus);

  const sortedCheckIns = [...filteredCheckIns].sort((a, b) => {
    if (sortBy === 'score') {
      return b.aiInsights.overallScore - a.aiInsights.overallScore;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Check-ins</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and respond to client check-ins and progress updates
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Check-ins</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
              className="rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by AI Score</option>
            </select>
          </div>
        </div>

        {/* Check-ins Grid */}
        <div className="grid grid-cols-1 gap-6">
          {sortedCheckIns.map((checkIn) => (
            <div
              key={checkIn.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <ClipboardDocumentCheckIcon className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{checkIn.clientName}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{checkIn.date}</span>
                        <span className="text-gray-300">|</span>
                        <span>{checkIn.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <SparklesIcon className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-medium text-gray-900">AI Score: {checkIn.aiInsights.overallScore}</span>
                      </div>
                      <span className={`text-xs font-medium ${
                        checkIn.aiInsights.priorityLevel === 'high' ? 'text-red-600' :
                        checkIn.aiInsights.priorityLevel === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {checkIn.aiInsights.priorityLevel.charAt(0).toUpperCase() + checkIn.aiInsights.priorityLevel.slice(1)} Priority
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      checkIn.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {checkIn.status === 'pending' ? 'Pending Review' : 'Completed'}
                    </span>
                  </div>
                </div>

                {/* AI Insights Summary */}
                <div className="mb-6 bg-indigo-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-indigo-900 mb-2 flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4" />
                    AI Insights
                  </h3>
                  <p className="text-sm text-indigo-900 mb-3">{checkIn.aiInsights.summary}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-indigo-900 mb-2">Key Wins</h4>
                      <ul className="space-y-1">
                        {checkIn.aiInsights.wins.map((win, index) => (
                          <li key={index} className="text-sm text-indigo-800 flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                            {win}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-indigo-900 mb-2">Areas of Focus</h4>
                      <ul className="space-y-1">
                        {checkIn.aiInsights.struggles.map((struggle, index) => (
                          <li key={index} className="text-sm text-indigo-800 flex items-center gap-2">
                            <ArrowTrendingUpIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            {struggle}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
                  <MetricCard
                    label="Nutrition"
                    value={checkIn.metrics.nutrition.score}
                    trend={checkIn.metrics.nutrition.trend}
                    previousValue={checkIn.metrics.nutrition.previousScore}
                    icon={FireIcon}
                  />
                  <MetricCard
                    label="Exercise"
                    value={checkIn.metrics.exercise.score}
                    trend={checkIn.metrics.exercise.trend}
                    previousValue={checkIn.metrics.exercise.previousScore}
                    icon={ChartBarIcon}
                  />
                  <MetricCard
                    label="Sleep"
                    value={checkIn.metrics.sleep.score}
                    trend={checkIn.metrics.sleep.trend}
                    previousValue={checkIn.metrics.sleep.previousScore}
                    icon={MoonIcon}
                  />
                  <MetricCard
                    label="Stress"
                    value={checkIn.metrics.stress.score}
                    trend={checkIn.metrics.stress.trend}
                    previousValue={checkIn.metrics.stress.previousScore}
                    icon={HeartIcon}
                  />
                  <MetricCard
                    label="Energy"
                    value={checkIn.metrics.energy.score}
                    trend={checkIn.metrics.energy.trend}
                    previousValue={checkIn.metrics.energy.previousScore}
                    icon={ArrowTrendingUpIcon}
                  />
                </div>

                {/* Notes and Goals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600">{checkIn.notes}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Goals</h3>
                    <div className="space-y-2">
                      {checkIn.goals.completed.map((goal, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600">{goal}</span>
                        </div>
                      ))}
                      {checkIn.goals.inProgress.map((goal, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          <span className="text-gray-600">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Attachments and Audio Messages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {checkIn.attachments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
                      <div className="space-y-2">
                        {checkIn.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                          >
                            <ClipboardDocumentCheckIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {checkIn.audioMessages.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        Audio Messages ({checkIn.audioMessages.length})
                      </h3>
                      <div className="space-y-2">
                        {checkIn.audioMessages.map((audio) => (
                          <div
                            key={audio.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                          >
                            <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{audio.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <Link
                    href={`/admin/check-ins/${checkIn.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">View Check-in</span>
                  </Link>
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Reply</span>
                  </button>
                  {checkIn.status === 'pending' && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Mark as Reviewed</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, previousValue, icon: Icon }) {
  const trendColor = trend === 'up' ? 'text-emerald-600' : 'text-red-600';
  const trendBg = trend === 'up' ? 'bg-emerald-50' : 'bg-red-50';
  const difference = trend === 'up' ? value - previousValue : previousValue - value;

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <div className="flex items-baseline">
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
        <span className="ml-2 text-sm font-medium text-gray-500">/100</span>
      </div>
      <div className="mt-2 flex items-center">
        <ArrowTrendingUpIcon
          className={`h-4 w-4 ${trendColor} ${trend === 'down' ? 'transform rotate-180' : ''}`}
        />
        <span className={`ml-1 text-xs font-medium ${trendColor}`}>
          {difference}%
        </span>
      </div>
    </div>
  );
} 