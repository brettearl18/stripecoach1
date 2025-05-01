'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// Mock data (matching the data from the check-ins list)
const mockCheckIns = [
  {
    id: '1',
    clientId: 'sarah-johnson',
    clientName: 'Sarah Johnson',
    clientAvatar: '/avatars/sarah.jpg',
    status: 'pending',
    submittedAt: '2024-03-15T09:30:00Z',
    summary: 'Completed all workouts, following nutrition plan well',
    urgency: 'high',
    compliance: 85,
    hasPhotos: true,
    responses: [
      { question: 'How was your energy level today?', answer: '4/5', type: 'scale' },
      { question: 'Did you complete all planned workouts?', answer: 'Yes, completed all sessions as planned', type: 'text' },
      { question: 'Any challenges or obstacles?', answer: 'Evening cravings were strong but managed to stay on track', type: 'text' },
      { question: 'Water intake (liters)', answer: '2.5', type: 'number' },
      { question: 'Sleep quality', answer: '4/5', type: 'scale' }
    ],
    progressPhotos: ['/mock/progress1.jpg', '/mock/progress2.jpg'],
  metrics: {
      weight: '68 kg',
      bodyFat: '22%',
      energy: '4/5',
      stress: '2/5'
    }
  },
  {
    id: '2',
    clientId: 'michael-chen',
    clientName: 'Michael Chen',
    clientAvatar: '/avatars/michael.jpg',
    status: 'reviewed',
    submittedAt: '2024-03-15T08:15:00Z',
    summary: 'Great progress this week, hitting all targets',
    urgency: 'medium',
    compliance: 92,
    hasPhotos: true,
    responses: [
      { question: 'How was your energy level today?', answer: '5/5', type: 'scale' },
      { question: 'Did you complete all planned workouts?', answer: 'Yes, exceeded targets', type: 'text' },
      { question: 'Any challenges or obstacles?', answer: 'None this week', type: 'text' },
      { question: 'Water intake (liters)', answer: '3.2', type: 'number' },
      { question: 'Sleep quality', answer: '5/5', type: 'scale' }
    ],
    progressPhotos: ['/mock/progress3.jpg', '/mock/progress4.jpg'],
    metrics: {
      weight: '75 kg',
      bodyFat: '15%',
      energy: '5/5',
      stress: '1/5'
    }
  },
  {
    id: '3',
    clientId: 'emma-wilson',
    clientName: 'Emma Wilson',
    clientAvatar: '/avatars/emma.jpg',
    status: 'pending',
    submittedAt: '2024-03-14T18:45:00Z',
    summary: 'Struggling with evening cravings, need guidance',
    urgency: 'high',
    compliance: 78,
    hasPhotos: true,
    responses: [
      { question: 'How was your energy level today?', answer: '3/5', type: 'scale' },
      { question: 'Did you complete all planned workouts?', answer: 'Missed one session', type: 'text' },
      { question: 'Any challenges or obstacles?', answer: 'Evening cravings are becoming harder to manage', type: 'text' },
      { question: 'Water intake (liters)', answer: '2.0', type: 'number' },
      { question: 'Sleep quality', answer: '3/5', type: 'scale' }
    ],
    progressPhotos: ['/mock/progress5.jpg', '/mock/progress6.jpg'],
    metrics: {
      weight: '62 kg',
      bodyFat: '24%',
      energy: '3/5',
      stress: '4/5'
    }
  }
];

export default function CheckInDetail() {
  const params = useParams();
  const [checkIn, setCheckIn] = useState(mockCheckIns.find(c => c.id === params.id));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'reviewed':
        return 'bg-blue-500/10 text-blue-500';
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (!checkIn) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Check-in not found</h1>
          <Link href="/coach/check-ins" className="text-blue-500 hover:underline">
            ← Back to check-ins
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/coach/check-ins"
            className="inline-flex items-center text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to check-ins
          </Link>
          
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center text-xl font-medium">
                {checkIn.clientName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{checkIn.clientName}</h1>
                <p className="text-gray-400">Submitted {new Date(checkIn.submittedAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(checkIn.status)}`}>
                {checkIn.status}
            </span>
              <span className={`flex items-center gap-1 ${getUrgencyColor(checkIn.urgency)}`}>
                <ExclamationTriangleIcon className="h-5 w-5" />
                {checkIn.urgency} priority
            </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Compliance Score</h3>
              <ChartBarIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold">{checkIn.compliance}%</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Response Time</h3>
              <ClockIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold">24h</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Progress Photos</h3>
              <CameraIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold">{checkIn.progressPhotos?.length || 0}</div>
                      </div>
                    </div>

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">Summary</h3>
            <p className="text-gray-300">{checkIn.summary}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">Check-in Responses</h3>
            <div className="space-y-4">
              {checkIn.responses.map((response, index) => (
                <div key={index} className="border-b border-gray-700 last:border-0 pb-4 last:pb-0">
                  <p className="text-gray-400 mb-1">{response.question}</p>
                  <p className="text-white">{response.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {checkIn.metrics && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(checkIn.metrics).map(([key, value]) => (
                  <div key={key} className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                    <p className="text-lg font-medium">{value}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {checkIn.progressPhotos && checkIn.progressPhotos.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">Progress Photos</h3>
              <div className="grid grid-cols-2 gap-4">
                {checkIn.progressPhotos.map((photo, index) => (
                  <div key={index} className="aspect-square bg-gray-900/50 rounded-lg overflow-hidden">
                    <img src={photo} alt={`Progress photo ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {checkIn.status === 'pending' && (
          <div className="mt-8 flex gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Mark as Reviewed
            </button>
            <button className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600">
              Request Updates
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 