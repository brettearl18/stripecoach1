'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  MicrophoneIcon,
  PaperClipIcon,
  PlayIcon,
  VideoCameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAudioRecording } from '@/hooks/useAudioRecording';

interface CheckInData {
  id: string;
  clientName: string;
  date: string;
  type: string;
  status: 'pending' | 'reviewed' | 'completed';
  responses: {
    [key: string]: {
      question: string;
      answer: string | number | string[];
      type: 'text' | 'rating_scale' | 'photo' | 'multiple_choice';
    };
  };
  metrics: {
    [key: string]: {
      current: number;
      previous: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
}

export default function CheckInReview() {
  const params = useParams();
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [responseType, setResponseType] = useState<'text' | 'audio' | 'video' | null>(null);
  const [textResponse, setTextResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isRecording,
    recordedAudio,
    startRecording,
    stopRecording,
    cancelRecording,
    uploadRecording,
    error: recordingError
  } = useAudioRecording({
    onError: (error) => setError(error.message)
  });

  // Fetch check-in data
  useEffect(() => {
    const fetchCheckIn = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/check-ins/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch check-in');
        const data = await response.json();
        setCheckIn(data);
      } catch (err) {
        setError('Failed to load check-in data');
        console.error(err);
      }
    };

    if (params.id) {
      fetchCheckIn();
    }
  }, [params.id]);

  const handleSubmitResponse = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      let audioMessage;
      if (recordedAudio) {
        audioMessage = await uploadRecording();
      }

      // TODO: Replace with actual API call
      await fetch(`/api/check-ins/${params.id}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: responseType,
          text: textResponse,
          audioMessage,
        }),
      });

      router.push('/coach/check-ins');
    } catch (err) {
      setError('Failed to submit response');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!checkIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">
              {error || 'Loading check-in data...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/coach/check-ins"
              className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back to Check-ins
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Review Check-in
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {checkIn.clientName} • {new Date(checkIn.date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              checkIn.status === 'pending'
                ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400'
                : checkIn.status === 'reviewed'
                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400'
                : 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400'
            }`}>
              {checkIn.status.charAt(0).toUpperCase() + checkIn.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Client Responses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Responses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Client Responses
                </h2>
                <div className="space-y-6">
                  {Object.entries(checkIn.responses).map(([category, data]) => (
                    <div key={category} className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white capitalize mb-2">
                        {category.replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {data.question}
                      </p>
                      {data.type === 'photo' ? (
                        <div className="grid grid-cols-2 gap-4">
                          {(data.answer as string[]).map((photo, index) => (
                            <div key={index} className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                              {/* TODO: Replace with actual image component */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <PaperClipIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900 dark:text-white">
                          {data.answer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coach's Response */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Your Response
                </h2>

                {/* Response Type Selection */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <button
                    onClick={() => setResponseType('text')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-colors ${
                      responseType === 'text'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Text</span>
                  </button>
                  <button
                    onClick={() => setResponseType('audio')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-colors ${
                      responseType === 'audio'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <MicrophoneIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Voice Note</span>
                  </button>
                  <button
                    onClick={() => setResponseType('video')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-colors ${
                      responseType === 'video'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <VideoCameraIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Video</span>
                  </button>
                </div>

                {/* Text Response */}
                {responseType === 'text' && (
                  <div className="space-y-4">
                    <textarea
                      value={textResponse}
                      onChange={(e) => setTextResponse(e.target.value)}
                      placeholder="Type your response here..."
                      className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                {/* Audio Response */}
                {responseType === 'audio' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isSubmitting}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isRecording 
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-blue-500/20 text-blue-500'
                        }`}
                      >
                        <MicrophoneIcon className="w-5 h-5" />
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                      </button>

                      {recordedAudio && (
                        <div className="flex items-center gap-2 flex-1">
                          <button className="p-2 rounded-full bg-blue-500/20 text-blue-500">
                            <PlayIcon className="w-5 h-5" />
                          </button>
                          <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full">
                            <div className="h-1 w-0 bg-blue-500 rounded-full"></div>
                          </div>
                          <button
                            onClick={cancelRecording}
                            className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Video Response */}
                {responseType === 'video' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <VideoCameraIcon className="w-5 h-5" />
                        Record Video
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {(error || recordingError) && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg">
                    {error || recordingError}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 mt-6">
                  <button
                    onClick={() => router.push('/coach/check-ins')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitResponse}
                    disabled={isSubmitting || (!textResponse && !recordedAudio)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Response'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Metrics and History */}
          <div className="space-y-6">
            {/* Metrics Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Metrics Overview
                </h2>
                <div className="space-y-4">
                  {Object.entries(checkIn.metrics).map(([key, value]) => (
                    <div key={key} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {key.replace('_', ' ')}
                        </h3>
                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                          value.trend === 'up'
                            ? 'text-green-600 dark:text-green-400'
                            : value.trend === 'down'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {value.change > 0 ? '+' : ''}{value.change}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Current</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {value.current}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Previous</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {value.previous}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Link
                    href={`/coach/clients/${checkIn.clientId}/history`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      View Check-in History
                    </span>
                  </Link>
                  <Link
                    href={`/coach/clients/${checkIn.clientId}/metrics`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChartBarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      View Progress Metrics
                    </span>
                  </Link>
                  <Link
                    href={`/coach/clients/${checkIn.clientId}/chat`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Open Chat
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 