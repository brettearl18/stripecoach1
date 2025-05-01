'use client';

import { useState } from 'react';
import {
  ChatBubbleLeftIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  MicrophoneIcon,
  PhotoIcon,
  PlusIcon,
  StarIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

// Mock data
const mockCheckIn = {
  id: 'check-in-123',
  clientName: 'Sarah Johnson',
  clientAvatar: 'https://i.pravatar.cc/150?img=1',
  submittedAt: new Date(),
  responses: {
    'training-adherence': {
      question: 'How many training sessions did you complete this week?',
      answer: '4 out of 5',
      score: 80,
    },
    'training-intensity': {
      question: 'Rate your average training intensity (1-10)',
      answer: '8',
      score: 80,
    },
    'nutrition-meals': {
      question: 'How many planned meals did you follow?',
      answer: '18 out of 21',
      score: 85,
    },
    'nutrition-water': {
      question: 'Daily water intake (liters)',
      answer: '2.5',
      score: 83,
    },
    'mindset-stress': {
      question: 'Rate your stress levels (1-10)',
      answer: '6',
      score: 60,
    },
    'mindset-sleep': {
      question: 'Average sleep duration',
      answer: '7 hours',
      score: 70,
    },
  },
  photos: [
    { url: 'https://i.pravatar.cc/300?img=2', type: 'progress' },
    { url: 'https://i.pravatar.cc/300?img=3', type: 'progress' },
  ],
  metrics: {
    weight: { value: 68.5, unit: 'kg', change: -0.5 },
    bodyFat: { value: 22, unit: '%', change: -0.3 },
    energy: { value: 7, unit: '/10', change: 1 },
  },
  complianceScores: {
    training: 80,
    nutrition: 84,
    mindset: 65,
    overall: 76,
  },
};

const quickResponses = {
  praise: [
    'Great job hitting your training targets this week! 💪',
    'Your nutrition compliance is impressive! 🥗',
    'I can see real progress in your photos! 📸',
  ],
  improvements: [
    'Let\'s focus on increasing your water intake this week.',
    'Try to get an extra hour of sleep to help with recovery.',
    'Consider adding some stress management techniques.',
  ],
  questions: [
    'How are you feeling about the workout intensity?',
    'Are you experiencing any difficulties with meal prep?',
    'Would you like to schedule a quick call to discuss your progress?',
  ],
};

export default function CheckInReview() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [responseType, setResponseType] = useState('text');
  const [feedback, setFeedback] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [customTask, setCustomTask] = useState('');

  const getComplianceColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const addQuickResponse = (response: string) => {
    setFeedback(prev => prev ? `${prev}\n${response}` : response);
  };

  const addTask = (task: string) => {
    setSelectedTasks(prev => [...prev, task]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={mockCheckIn.clientAvatar}
              alt={mockCheckIn.clientName}
              className="h-12 w-12 rounded-full"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mockCheckIn.clientName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Submitted {format(mockCheckIn.submittedAt, 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Previous Check-in
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
              Submit Review
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 mt-6">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'overview'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('responses')}
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'responses'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Responses
          </button>
          <button
            onClick={() => setSelectedTab('photos')}
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'photos'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Photos
          </button>
          <button
            onClick={() => setSelectedTab('metrics')}
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'metrics'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Metrics
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Client Data */}
          <div className="col-span-2 space-y-6">
            {/* Compliance Scores */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Compliance Scores
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(mockCheckIn.complianceScores).map(([key, score]) => (
                    <div key={key} className="text-center">
                      <div className={`text-2xl font-bold ${getComplianceColor(score)}`}>
                        {score}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {key}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Client Responses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Check-in Responses
                </h2>
                <div className="space-y-6">
                  {Object.entries(mockCheckIn.responses).map(([key, data]) => (
                    <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {data.question}
                        </h3>
                        <span className={`text-sm font-medium ${getComplianceColor(data.score)}`}>
                          {data.score}%
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-white">{data.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Photos */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Progress Photos
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {mockCheckIn.photos.map((photo, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={photo.url}
                        alt="Progress"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Coach Response */}
          <div className="space-y-6">
            {/* Response Type Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Response Type
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setResponseType('text')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                      responseType === 'text'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                    <span className="mt-2 text-sm font-medium">Text</span>
                  </button>
                  <button
                    onClick={() => setResponseType('audio')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                      responseType === 'audio'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <MicrophoneIcon className="h-6 w-6 text-gray-400" />
                    <span className="mt-2 text-sm font-medium">Voice</span>
                  </button>
                  <button
                    onClick={() => setResponseType('video')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                      responseType === 'video'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <VideoCameraIcon className="h-6 w-6 text-gray-400" />
                    <span className="mt-2 text-sm font-medium">Video</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Responses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Responses
                </h2>
                <div className="space-y-4">
                  {Object.entries(quickResponses).map(([category, responses]) => (
                    <div key={category} className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {responses.map((response, index) => (
                          <button
                            key={index}
                            onClick={() => addQuickResponse(response)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            {response}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback Input */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Your Feedback
                </h2>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your feedback..."
                />
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Action Items
                </h2>
                <div className="space-y-4">
                  {selectedTasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">{task}</span>
                      <button
                        onClick={() => setSelectedTasks(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTask}
                      onChange={(e) => setCustomTask(e.target.value)}
                      placeholder="Add new action item..."
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        if (customTask.trim()) {
                          addTask(customTask);
                          setCustomTask('');
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 