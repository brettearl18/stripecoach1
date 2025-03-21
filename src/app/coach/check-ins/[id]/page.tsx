'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  ArrowPathIcon,
  ClockIcon,
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  CalendarDaysIcon,
  LightBulbIcon,
  XMarkIcon,
  BellIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

// Sample check-in data
const checkInData = {
  id: '1',
  clientName: 'Sarah Johnson',
  clientInfo: {
    photo: '/sarah-profile.jpg', // You'll need to add this image to your public folder
    joinDate: '2023-09-15',
    streak: 24,
    achievements: [
      { name: 'Perfect Week', count: 12 },
      { name: 'Training Beast', count: 8 },
      { name: 'Sleep Champion', count: 5 },
    ],
    completionRate: '95%',
    totalCheckIns: 96,
  },
  date: '2024-03-12',
  metrics: {
    nutrition: {
      score: 85,
      details: {
        mealsTracked: 4,
        proteinTarget: '90%',
        waterIntake: '2.8L',
      }
    },
    training: {
      score: 90,
      details: {
        sessionsCompleted: 4,
        intensity: 'High',
        recoveryQuality: 'Good',
      }
    },
    sleep: {
      score: 85,
      details: {
        averageHours: 7.5,
        quality: 'Good',
        consistency: 'Improved',
      }
    },
    mood: {
      score: 80,
      details: {
        energyLevel: 'High',
        stressLevel: 'Moderate',
        motivation: 'Strong',
      }
    }
  },
  clientNotes: "Had a great week overall. Struggled a bit with late-night snacking on Tuesday, but managed to stay on track the rest of the week. Really feeling stronger in my training sessions.",
  aiAnalysis: {
    summary: "Strong adherence to program with notable improvements in training intensity and sleep consistency. Minor nutrition challenges identified.",
    keyInsights: [
      "Consistent high-quality training performance indicating readiness for progressive overload",
      "Sleep quality shows improvement, positively impacting recovery",
      "Evening nutrition habits present an opportunity for optimization",
      "Overall mood and motivation remain high, supporting continued progress"
    ],
    recommendedActions: [
      "Consider implementing evening routine to prevent late-night snacking",
      "Maintain current training intensity while monitoring recovery",
      "Continue focus on sleep consistency",
      "Introduce protein-rich evening snack options"
    ]
  },
  subcategories: {
    weekly: {
      nutrition: { status: 'completed', lastCheckin: '2024-03-12' },
      training: { status: 'pending', lastCheckin: '2024-03-05' },
      sleep: { status: 'completed', lastCheckin: '2024-03-12' },
      stress: { status: 'overdue', lastCheckin: '2024-02-28' },
      mindset: { status: 'completed', lastCheckin: '2024-03-11' },
    },
    monthly: {
      measurements: { status: 'pending', lastCheckin: '2024-02-15' },
      photos: { status: 'completed', lastCheckin: '2024-03-01' },
      goals: { status: 'completed', lastCheckin: '2024-03-01' },
    }
  }
};

export default function CheckInReview() {
  const [isEditing, setIsEditing] = useState(false);
  const [aiResponse, setAiResponse] = useState(checkInData.aiAnalysis);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [selectedResponseType, setSelectedResponseType] = useState<'approve' | 'custom' | 'loom' | 'voice' | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [focusPrompt, setFocusPrompt] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderHours, setReminderHours] = useState(24);
  const [customHours, setCustomHours] = useState('');

  const focusAreas = [
    { id: 'nutrition', label: 'Nutrition Habits', icon: '🍎' },
    { id: 'training', label: 'Training Progress', icon: '💪' },
    { id: 'sleep', label: 'Sleep Quality', icon: '😴' },
    { id: 'stress', label: 'Stress Management', icon: '🧘‍♀️' },
    { id: 'goals', label: 'Goal Progress', icon: '🎯' },
    { id: 'motivation', label: 'Motivation', icon: '🔥' },
  ];

  const reminderOptions = [
    { hours: 4, label: '4 hours' },
    { hours: 8, label: '8 hours' },
    { hours: 24, label: '1 day' },
    { hours: 72, label: '3 days' },
    { hours: 168, label: '1 week' },
  ];

  const handleRegenerateAI = () => {
    setShowPromptModal(true);
  };

  const handleGenerateWithPrompt = () => {
    setIsGeneratingResponse(true);
    setShowPromptModal(false);
    
    // Simulate AI regeneration with focus areas and custom prompt
    setTimeout(() => {
      setIsGeneratingResponse(false);
      // Here you would typically make an API call with the focus areas and prompt
    }, 2000);
    
    // Reset prompt and focus areas after generation
    setFocusPrompt('');
    setSelectedFocus([]);
  };

  const toggleFocusArea = (id: string) => {
    setSelectedFocus(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
  };

  const handleSaveForLater = () => {
    setShowReminderModal(true);
  };

  const handleSetReminder = () => {
    const hours = customHours ? parseInt(customHours) : reminderHours;
    // Here you would typically make an API call to save the reminder
    console.log(`Reminder set for ${hours} hours`);
    setShowReminderModal(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Client Profile */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Title and Navigation */}
            <div className="lg:col-span-2">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                      Check-in Review
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                      {checkInData.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleRegenerateAI}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <ArrowPathIcon className={`h-4 w-4 ${isGeneratingResponse ? 'animate-spin' : ''}`} />
                      Regenerate AI Response
                    </button>
                  </div>
                </div>
                
                {/* Navigation Links */}
                <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                  <Link
                    href={`/coach/clients/${checkInData.id}/check-ins`}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600"
                  >
                    <ClockIcon className="h-4 w-4" />
                    View Check-in History
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href={`/coach/clients/${checkInData.id}/dashboard`}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600"
                  >
                    <ChartBarIcon className="h-4 w-4" />
                    View Client Dashboard
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Client Profile Summary */}
            <div className="lg:border-l lg:pl-6 lg:border-gray-200">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={checkInData.clientInfo.photo}
                    alt={checkInData.clientName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {checkInData.clientName}
                  </h2>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span>Member since {new Date(checkInData.clientInfo.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Achievement Summary */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                  <FireIcon className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {checkInData.clientInfo.streak} Day Streak
                    </div>
                    <div className="text-xs text-gray-500">
                      Current
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                  <TrophyIcon className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {checkInData.clientInfo.achievements.reduce((sum, a) => sum + a.count, 0)} Badges
                    </div>
                    <div className="text-xs text-gray-500">
                      Total Earned
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Completion Rate</span>
                  <span className="font-medium text-gray-900">{checkInData.clientInfo.completionRate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Check-ins</span>
                  <span className="font-medium text-gray-900">{checkInData.clientInfo.totalCheckIns}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Overview Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Check-in Overview</h2>
              
              {/* Weekly Check-ins */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Weekly Check-ins</h3>
                <div className="space-y-3">
                  {Object.entries(checkInData.subcategories.weekly).map(([category, data]) => (
                    <div key={category} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(data.status)}
                        <span className="text-sm text-gray-900 capitalize">{category}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(data.lastCheckin).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Check-ins */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly Check-ins</h3>
                <div className="space-y-3">
                  {Object.entries(checkInData.subcategories.monthly).map(([category, data]) => (
                    <div key={category} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(data.status)}
                        <span className="text-sm text-gray-900 capitalize">{category}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(data.lastCheckin).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metrics</h2>
              <div className="space-y-4">
                {Object.entries(checkInData.metrics).map(([key, value]: [string, any]) => (
                  <div key={key} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 capitalize">{key}</h3>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-16 rounded-full ${
                          value.score >= 80 ? 'bg-green-200' :
                          value.score >= 60 ? 'bg-yellow-200' :
                          'bg-red-200'
                        }`}>
                          <div
                            className={`h-2 rounded-full ${
                              value.score >= 80 ? 'bg-green-500' :
                              value.score >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${value.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{value.score}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(value.details).map(([detailKey, detailValue]) => (
                        <div key={detailKey} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 capitalize">
                            {detailKey.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-gray-900">{detailValue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Notes */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Notes</h2>
              <p className="text-gray-600">{checkInData.clientNotes}</p>
            </div>
          </div>

          {/* AI Analysis and Response Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Analysis */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">AI Analysis</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {isEditing ? 'Save Changes' : 'Edit Analysis'}
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
                  {isEditing ? (
                    <textarea
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={aiResponse.summary}
                      onChange={(e) => setAiResponse({...aiResponse, summary: e.target.value})}
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300">{aiResponse.summary}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Key Insights</h3>
                  <ul className="space-y-2">
                    {aiResponse.keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {isEditing ? (
                          <input
                            type="text"
                            className="flex-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={insight}
                            onChange={(e) => {
                              const newInsights = [...aiResponse.keyInsights];
                              newInsights[index] = e.target.value;
                              setAiResponse({...aiResponse, keyInsights: newInsights});
                            }}
                          />
                        ) : (
                          <span className="text-gray-600 dark:text-gray-300">{insight}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Recommended Actions</h3>
                  <ul className="space-y-2">
                    {aiResponse.recommendedActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ArrowPathIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        {isEditing ? (
                          <input
                            type="text"
                            className="flex-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={action}
                            onChange={(e) => {
                              const newActions = [...aiResponse.recommendedActions];
                              newActions[index] = e.target.value;
                              setAiResponse({...aiResponse, recommendedActions: newActions});
                            }}
                          />
                        ) : (
                          <span className="text-gray-600 dark:text-gray-300">{action}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Response Options */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Response Options</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedResponseType('approve')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border ${
                    selectedResponseType === 'approve'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  } transition-colors`}
                >
                  <CheckCircleIcon className={`h-6 w-6 ${
                    selectedResponseType === 'approve' ? 'text-emerald-500' : 'text-gray-400'
                  }`} />
                  <span className="text-sm font-medium">
                    Approve & Send AI Response
                  </span>
                </button>

                <button
                  onClick={() => setSelectedResponseType('custom')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border ${
                    selectedResponseType === 'custom'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  } transition-colors`}
                >
                  <PencilSquareIcon className={`h-6 w-6 ${
                    selectedResponseType === 'custom' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    selectedResponseType === 'custom'
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    Write Custom Response
                  </span>
                </button>

                <button
                  onClick={() => setSelectedResponseType('loom')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border ${
                    selectedResponseType === 'loom'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  } transition-colors`}
                >
                  <VideoCameraIcon className={`h-6 w-6 ${
                    selectedResponseType === 'loom' ? 'text-purple-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    selectedResponseType === 'loom'
                      ? 'text-purple-700 dark:text-purple-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    Record Loom Video
                  </span>
                </button>

                <button
                  onClick={() => setSelectedResponseType('voice')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border ${
                    selectedResponseType === 'voice'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  } transition-colors`}
                >
                  <MicrophoneIcon className={`h-6 w-6 ${
                    selectedResponseType === 'voice' ? 'text-rose-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    selectedResponseType === 'voice'
                      ? 'text-rose-700 dark:text-rose-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    Record Voice Note
                  </span>
                </button>

                <button
                  onClick={handleSaveForLater}
                  className="flex items-center justify-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <BellIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    Save for Later
                  </span>
                </button>
              </div>

              {selectedResponseType && (
                <div className="mt-6">
                  <div className="flex items-center justify-end gap-4">
                    <button
                      onClick={() => setSelectedResponseType(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
                    >
                      {selectedResponseType === 'approve' ? 'Send Response' :
                       selectedResponseType === 'custom' ? 'Save & Send' :
                       selectedResponseType === 'loom' ? 'Start Recording' :
                       'Start Voice Note'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    onClick={() => setShowReminderModal(false)}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                    <BellIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                      Set Reminder
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        When would you like to be reminded to review this check-in?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="grid grid-cols-3 gap-2">
                    {reminderOptions.map((option) => (
                      <button
                        key={option.hours}
                        onClick={() => setReminderHours(option.hours)}
                        className={`p-2 rounded-lg border text-center ${
                          reminderHours === option.hours && !customHours
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Custom Reminder
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        value={customHours}
                        onChange={(e) => {
                          setCustomHours(e.target.value);
                          setReminderHours(0);
                        }}
                        placeholder="Enter hours"
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">hours</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6">
                  <button
                    onClick={handleSetReminder}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Set Reminder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Focus Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    onClick={() => setShowPromptModal(false)}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                    <LightBulbIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                      Focus AI Analysis
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select areas to focus on and add any specific instructions for the AI analysis.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Focus Areas
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {focusAreas.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => toggleFocusArea(area.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left ${
                          selectedFocus.includes(area.id)
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <span className="text-xl">{area.icon}</span>
                        <span className="text-sm font-medium">{area.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="focus-prompt"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Additional Instructions
                  </label>
                  <textarea
                    id="focus-prompt"
                    rows={3}
                    className="mt-2 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="E.g., Focus on sleep quality improvement strategies..."
                    value={focusPrompt}
                    onChange={(e) => setFocusPrompt(e.target.value)}
                  />
                </div>

                <div className="mt-5 sm:mt-6">
                  <button
                    onClick={handleGenerateWithPrompt}
                    disabled={selectedFocus.length === 0}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 