'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import { useAudioRecording } from '@/hooks/useAudioRecording';

interface CheckInData {
  id: string;
  clientName: string;
  clientInfo: {
    photo: string;
    joinDate: string;
    streak: number;
    achievements: { name: string; count: number }[];
    completionRate: string;
    totalCheckIns: number;
  };
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
  clientNotes: string;
  aiAnalysis: {
    summary: string;
    keyInsights: string[];
    recommendedActions: string[];
  };
  subcategories: {
    weekly: {
      nutrition: { status: string; lastCheckin: string };
      training: { status: string; lastCheckin: string };
      sleep: { status: string; lastCheckin: string };
      stress: { status: string; lastCheckin: string };
      mindset: { status: string; lastCheckin: string };
    };
    monthly: {
      measurements: { status: string; lastCheckin: string };
      photos: { status: string; lastCheckin: string };
      goals: { status: string; lastCheckin: string };
    };
  };
}

export default function CheckInReview() {
  const params = useParams();
  const router = useRouter();
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [selectedResponseType, setSelectedResponseType] = useState<'text' | 'audio' | 'video' | null>(null);
  const [textResponse, setTextResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {
    const fetchCheckIn = async () => {
      try {
        const response = await fetch(`/api/check-ins/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch check-in');
        const data = await response.json();
        setCheckInData(data);
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

      await fetch(`/api/check-ins/${params.id}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedResponseType,
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

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (recordedAudio) {
      audioRef.current = new Audio(URL.createObjectURL(recordedAudio));
      audioRef.current.onended = () => setIsPlaying(false);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, [recordedAudio]);

  if (!checkInData) {
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Check-ins
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(checkInData.date).toLocaleDateString()}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              checkInData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              checkInData.status === 'reviewed' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {checkInData.status.charAt(0).toUpperCase() + checkInData.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Client Responses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Client Responses
                </h2>
                <div className="space-y-6">
                  {Object.entries(checkInData.responses).map(([key, response]) => (
                    <div key={key} className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {response.question}
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-900 dark:text-white">
                          {Array.isArray(response.answer) 
                            ? response.answer.join(', ')
                            : response.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Response Options */}
          <div className="space-y-6">
            {/* Metrics Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Metrics Overview
                </h2>
                <div className="space-y-4">
                  {Object.entries(checkInData.metrics).map(([key, metric]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {metric.current}
                        </span>
                        <span className={`text-sm ${
                          metric.trend === 'up' ? 'text-green-500' :
                          metric.trend === 'down' ? 'text-red-500' :
                          'text-gray-500'
                        }`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Response Options */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Send Response
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedResponseType('text')}
                    className={`w-full flex items-center justify-center gap-2 p-4 rounded-lg border transition-colors ${
                      selectedResponseType === 'text'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Text Response</span>
                  </button>

                  <button
                    onClick={() => setSelectedResponseType('audio')}
                    className={`w-full flex items-center justify-center gap-2 p-4 rounded-lg border transition-colors ${
                      selectedResponseType === 'audio'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <MicrophoneIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Voice Note</span>
                  </button>

                  <button
                    onClick={() => setSelectedResponseType('video')}
                    className={`w-full flex items-center justify-center gap-2 p-4 rounded-lg border transition-colors ${
                      selectedResponseType === 'video'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <VideoCameraIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Video Response</span>
                  </button>
                </div>

                {/* Response Input */}
                {selectedResponseType && (
                  <div className="mt-6">
                    {selectedResponseType === 'text' && (
                      <textarea
                        value={textResponse}
                        onChange={(e) => setTextResponse(e.target.value)}
                        placeholder="Type your response here..."
                        className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        disabled={isSubmitting}
                      />
                    )}

                    {selectedResponseType === 'audio' && (
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
                              <button 
                                onClick={handlePlayAudio}
                                className="p-2 rounded-full bg-blue-500/20 text-blue-500"
                              >
                                {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                              </button>
                              <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full">
                                <div 
                                  className="h-1 bg-blue-500 rounded-full transition-all duration-1000"
                                  style={{ width: isPlaying ? '100%' : '0%' }}
                                />
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

                    {selectedResponseType === 'video' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            <VideoCameraIcon className="w-5 h-5" />
                            Record Video
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleSubmitResponse}
                        disabled={isSubmitting || (!textResponse && !recordedAudio)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Response'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 