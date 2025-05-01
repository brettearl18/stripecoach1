'use client';

import { useState, useRef, useEffect } from 'react';
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
  CalendarIcon,
  ArrowRightIcon,
  UserCircleIcon,
  ScaleIcon,
  HeartIcon,
  BoltIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  CameraIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { format } from 'date-fns';
import { mockCheckIn } from './mockCheckIn';
import Image from 'next/image';

interface ResponseComment {
  type: 'text' | 'audio';
  content: string;
  timestamp: string;
}

interface CheckInData {
  id: string;
  clientId: string;
  type: string;
  date: string;
  status: 'pending' | 'reviewed' | 'completed';
  client: {
    id: string;
    name: string;
    email: string;
  };
  responses: Array<{
    question: string;
    answer: string | number;
    type: string;
    score: number;
  }>;
  metrics: {
    [key: string]: {
      value: number;
      unit: string;
      change: number;
    };
  };
  summary?: string;
  urgency: string;
}

// Add new interface for AI insights
interface AIInsight {
  type: 'improvement' | 'achievement' | 'attention' | 'trend';
  title: string;
  description: string;
  metric?: {
    current: number;
    previous: number;
    change: number;
  };
}

// Mock AI insights (in a real app, this would come from an AI service)
const mockAIInsights: AIInsight[] = [
  {
    type: 'improvement',
    title: 'Strong Recovery Trend',
    description: 'Energy levels have increased significantly (+1.5 points) while maintaining lower stress levels (4/10). This shows the effectiveness of your recovery protocols.',
    metric: {
      current: 8.5,
      previous: 7.0,
      change: 1.5
    }
  },
  {
    type: 'achievement',
    title: 'Perfect Training Adherence',
    description: 'Completed all 5 scheduled training sessions this week with good intensity (8.5/10). This is your first 100% completion week in the past month.',
  },
  {
    type: 'trend',
    title: 'Consistent Weight Loss',
    description: 'Steady progress in weight reduction (-0.8kg) while maintaining high nutrition compliance (90%). This sustainable approach has led to a total of 2.5kg loss over the past 3 weeks.',
    metric: {
      current: 82.5,
      previous: 83.3,
      change: -0.8
    }
  },
  {
    type: 'attention',
    title: 'Sleep Quality Opportunity',
    description: 'While sleep duration is good (7.8 hours), there\'s room to improve the consistency of your recovery protocols. Consider setting reminders for stretching sessions.',
  }
];

// Mock questions organized by category
const CHECK_IN_QUESTIONS = {
  training: [
    {
      id: 'training_1',
      question: 'How many training sessions did you complete this week?',
      type: 'rating_scale',
      answer: '4 out of 5',
      score: 80
    },
    {
      id: 'training_2',
      question: 'Rate your overall workout intensity (1-10)',
      type: 'rating_scale',
      answer: '8/10',
      score: 85
    },
    {
      id: 'training_3',
      question: 'Did you experience any unusual fatigue or pain?',
      type: 'text',
      answer: 'Slight soreness in lower back after deadlifts, but nothing concerning',
      score: 90
    }
  ],
  nutrition: [
    {
      id: 'nutrition_1',
      question: 'How well did you follow your meal plan?',
      type: 'rating_scale',
      answer: '9/10',
      score: 90
    },
    {
      id: 'nutrition_2',
      question: 'Did you track your daily water intake?',
      type: 'multiple_choice',
      answer: 'Yes, averaged 3L per day',
      score: 95
    },
    {
      id: 'nutrition_3',
      question: 'Any challenges with meal timing or hunger?',
      type: 'text',
      answer: 'Sometimes hungry late at night, might need to adjust dinner portions',
      score: 75
    }
  ],
  recovery: [
    {
      id: 'recovery_1',
      question: 'Average hours of sleep per night?',
      type: 'rating_scale',
      answer: '7.5 hours',
      score: 85
    },
    {
      id: 'recovery_2',
      question: 'Rate your overall stress levels (1-10)',
      type: 'rating_scale',
      answer: '6/10',
      score: 70
    },
    {
      id: 'recovery_3',
      question: 'Did you complete your recovery protocols?',
      type: 'multiple_choice',
      answer: 'Completed 2/3 recommended stretching sessions',
      score: 65
    }
  ],
  lifestyle: [
    {
      id: 'lifestyle_1',
      question: 'How would you rate your energy levels?',
      type: 'rating_scale',
      answer: '8/10',
      score: 80
    },
    {
      id: 'lifestyle_2',
      question: 'Any significant lifestyle changes this week?',
      type: 'text',
      answer: 'Started a new project at work, slightly more stressed but managing well',
      score: 85
    },
    {
      id: 'lifestyle_3',
      question: 'Are you maintaining a good work-life balance?',
      type: 'rating_scale',
      answer: '7/10',
      score: 75
    }
  ]
};

// Add mock check-in history data after the mockAIInsights
const mockCheckInHistory = [
  {
    date: '2024-03-15',
    score: 88.5,
    status: 'completed',
    week: 16
  },
  {
    date: '2024-03-08',
    score: 85.2,
    status: 'completed',
    week: 15
  },
  {
    date: '2024-03-01',
    score: 82.7,
    status: 'completed',
    week: 14
  },
  {
    date: '2024-02-23',
    score: 79.5,
    status: 'completed',
    week: 13
  },
  {
    date: '2024-02-16',
    score: 76.8,
    status: 'completed',
    week: 12
  },
  {
    date: '2024-02-09',
    score: null,
    status: 'missed',
    week: 11
  },
  {
    date: '2024-02-02',
    score: 73.4,
    status: 'completed',
    week: 10
  }
];

// AI Insights mock data
const aiInsights = [
  {
    type: 'improvement',
    title: 'Significant Progress',
    description: 'Weight reduction of 0.8kg this week shows consistent progress towards the goal.',
    metric: { current: 82.5, change: -0.8, unit: 'kg' }
  },
  {
    type: 'achievement',
    title: 'Energy Levels Improved',
    description: 'Energy score increased by 1.5 points, indicating better recovery and adaptation.',
    metric: { current: 8.5, change: 1.5, unit: '/10' }
  },
  {
    type: 'attention',
    title: 'Sleep Quality',
    description: 'While sleep duration has improved slightly, focus on maintaining consistent sleep schedule.',
    metric: { current: 7.8, change: 0.3, unit: 'hours' }
  }
];

// Progress tracking mock data
const progressHistory = [
  { week: 1, date: '2024-03-01', score: 82 },
  { week: 2, date: '2024-03-08', score: 85 },
  { week: 3, date: '2024-03-15', score: 88 },
  { week: 4, date: '2024-03-20', score: 85 }
];

// Add new interfaces for progress tracking
interface ProgressPhotos {
  date: string;
  photos: {
    front?: string;
    side?: string;
    back?: string;
  };
}

interface BodyMeasurement {
  date: string;
  measurements: {
    weight?: number;
    bodyFat?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
}

// Mock data for progress tracking
const mockProgressPhotos: ProgressPhotos[] = [
  {
    date: '2024-03-20',
    photos: {
      front: '/mock/progress-front.jpg',
      side: '/mock/progress-side.jpg',
      back: '/mock/progress-back.jpg',
    }
  }
];

const mockMeasurements: BodyMeasurement[] = [
  {
    date: '2024-03-20',
    measurements: {
      weight: 82.5,
      bodyFat: 18.5,
      chest: 102,
      waist: 88,
      hips: 98,
      arms: 36,
      thighs: 58
    }
  }
];

export default function CheckInReview() {
  const params = useParams();
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<CheckInData>(mockCheckIn);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [responseType, setResponseType] = useState<'text' | 'audio' | 'video' | 'link'>('text');
  const [feedback, setFeedback] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [customTask, setCustomTask] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseComments, setResponseComments] = useState<{ [key: string]: ResponseComment }>({});
  const [isRecordingComment, setIsRecordingComment] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [responses, setResponses] = useState<{[key: string]: {
    type: 'text' | 'audio' | 'video' | 'link';
    content: string;
    status: 'draft' | 'saved' | 'saving';
  }}>({});

  const {
    isRecording: audioRecordingIsRecording,
    recordedAudio: audioRecordingRecordedAudio,
    startRecording: audioRecordingStartRecording,
    stopRecording: audioRecordingStopRecording,
    cancelRecording: audioRecordingCancelRecording,
    uploadRecording: audioRecordingUploadRecording,
    error: audioRecordingError
  } = useAudioRecording({
    onError: (error) => setError(error.message)
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch check-in data
  useEffect(() => {
    const fetchCheckIn = async () => {
      try {
        // Using mock data instead of API call
        setCheckIn(mockCheckIn);
      } catch (err) {
        setError('Failed to load check-in data');
        console.error(err);
      }
    };

    if (params.id) {
      fetchCheckIn();
    }
  }, [params.id]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      let audioMessage;
      if (recordedAudio) {
        audioMessage = await audioRecordingUploadRecording();
      }

      // TODO: Replace with actual API call
      await fetch(`/api/check-ins/${params.id}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: responseType,
          text: feedback,
          audioMessage,
        }),
      });

      router.push('/coach/check-ins');
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate overall score
  const calculateOverallScore = (responses: CheckInData['responses']) => {
    const scores = Object.values(responses).map(r => r.score);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  if (!checkIn) {
    return (
      <div className="min-h-screen bg-[#13141A] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">
              {error || 'Loading check-in data...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getMetricIcon = (metricName: string) => {
    switch (metricName) {
      case 'weight':
        return <ScaleIcon className="h-5 w-5" />;
      case 'sleep':
        return <ClockIcon className="h-5 w-5" />;
      case 'energy':
        return <BoltIcon className="h-5 w-5" />;
      case 'stress':
        return <HeartIcon className="h-5 w-5" />;
      default:
        return <ChartBarIcon className="h-5 w-5" />;
    }
  };

  const getMetricChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-[#13141A] text-white">
      {/* Top Navigation Bar */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
            <Link
              href="/coach/check-ins"
              className="inline-flex items-center text-gray-400 hover:text-white"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Check-ins
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'history'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                History
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold">Check-in Review</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              checkIn.status === 'pending'
                  ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-800/20'
                  : 'bg-green-900/20 text-green-400 border border-green-800/20'
            }`}>
              {checkIn.status.charAt(0).toUpperCase() + checkIn.status.slice(1)}
            </span>
          </div>
            <p className="text-gray-400">
              Submitted on {format(new Date(checkIn.date), 'MMMM d, yyyy')} at {format(new Date(checkIn.date), 'h:mm a')}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.values(responses).some(r => r.status !== 'saved')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Complete Review
              </>
            )}
          </button>
        </div>

        {/* Client Info Card */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center">
              <UserCircleIcon className="h-10 w-10 text-gray-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-medium">{checkIn.client.name}</h2>
              <p className="text-gray-400">{checkIn.client.email}</p>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Link
                href={`/coach/clients/${checkIn.client.id}`}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View Profile
              </Link>
              <Link
                href={`/coach/messages?client=${checkIn.client.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Send Message
              </Link>
            </div>
                              </div>
                            </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="col-span-2 space-y-8">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(checkIn.metrics).map(([key, metric]) => (
                <div key={key} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-700 rounded-lg mr-3">
                        {getMetricIcon(key)}
                        </div>
                      <span className="text-sm font-medium capitalize">{key}</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">
                      {metric.value}
                      <span className="text-sm text-gray-400 ml-1">{metric.unit}</span>
                    </span>
                    <span className={`text-sm font-medium ${getMetricChangeColor(metric.change)}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Check-in Responses */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-medium mb-6">Check-in Responses</h3>
              <div className="space-y-8">
                {checkIn.responses.map((response, index) => (
                  <div key={index} className="border-b border-gray-700 pb-8 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-300">{response.question}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            response.score >= 90 
                              ? 'bg-green-900/20 text-green-400 border border-green-800/20'
                              : response.score >= 75
                              ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-800/20'
                              : 'bg-red-900/20 text-red-400 border border-red-800/20'
                          }`}>
                            Score: {response.score}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                      <p className="text-lg">{response.answer}</p>
                    </div>

                    {/* Coach Response Section */}
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-sm font-medium text-gray-400">Coach Response</h5>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const currentResponse = responses[response.id] || {};
                              setResponseType('text');
                              setResponses(prev => ({
                                ...prev,
                                [response.id]: { ...currentResponse, type: 'text' }
                              }));
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              (responses[response.id]?.type || responseType) === 'text'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                          >
                            <DocumentTextIcon className="h-4 w-4" />
                          </button>
                  <button
                            onClick={() => {
                              const currentResponse = responses[response.id] || {};
                              setResponseType('audio');
                              setResponses(prev => ({
                                ...prev,
                                [response.id]: { ...currentResponse, type: 'audio' }
                              }));
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              (responses[response.id]?.type || responseType) === 'audio'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                          >
                            <MicrophoneIcon className="h-4 w-4" />
                  </button>
                  <button
                            onClick={() => {
                              const currentResponse = responses[response.id] || {};
                              setResponseType('video');
                              setResponses(prev => ({
                                ...prev,
                                [response.id]: { ...currentResponse, type: 'video' }
                              }));
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              (responses[response.id]?.type || responseType) === 'video'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                          >
                            <VideoCameraIcon className="h-4 w-4" />
                  </button>
                  <button
                            onClick={() => {
                              const currentResponse = responses[response.id] || {};
                              setResponseType('link');
                              setResponses(prev => ({
                                ...prev,
                                [response.id]: { ...currentResponse, type: 'link' }
                              }));
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              (responses[response.id]?.type || responseType) === 'link'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                          >
                            <PaperClipIcon className="h-4 w-4" />
                  </button>
                        </div>
                </div>

                      {/* Response Input Based on Type */}
                      <div className="mt-2 space-y-3">
                        {(responses[response.id]?.type || responseType) === 'text' && (
                    <textarea
                            placeholder="Type your feedback..."
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            rows={3}
                            value={responses[response.id]?.content || ''}
                            onChange={(e) => {
                              setResponses(prev => ({
                                ...prev,
                                [response.id]: {
                                  type: 'text',
                                  content: e.target.value,
                                  status: 'draft'
                                }
                              }));
                            }}
                          />
                        )}

                        {(responses[response.id]?.type || responseType) === 'audio' && (
                          <div className="flex items-center gap-2">
                            {isRecording ? (
                              <button
                                onClick={stopRecording}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                              >
                                <span className="animate-pulse">●</span>
                                Stop Recording
                              </button>
                            ) : recordedAudio ? (
                              <div className="flex items-center gap-2">
                                <button className="px-4 py-2 bg-gray-700 text-white rounded-lg">
                                  <PlayIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setRecordedAudio(null);
                                    setResponses(prev => ({
                                      ...prev,
                                      [response.id]: {
                                        type: 'audio',
                                        content: '',
                                        status: 'draft'
                                      }
                                    }));
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Delete
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  startRecording();
                                  setResponses(prev => ({
                                    ...prev,
                                    [response.id]: {
                                      type: 'audio',
                                      content: 'recording...',
                                      status: 'draft'
                                    }
                                  }));
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                              >
                                <MicrophoneIcon className="h-5 w-5" />
                                Start Recording
                              </button>
                            )}
                  </div>
                )}

                        {(responses[response.id]?.type || responseType) === 'video' && (
                      <button
                            onClick={() => {
                              // Implement video recording
                              setResponses(prev => ({
                                ...prev,
                                [response.id]: {
                                  type: 'video',
                                  content: 'video_recording_placeholder',
                                  status: 'draft'
                                }
                              }));
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                          >
                            <VideoCameraIcon className="h-5 w-5" />
                            Record Video Message
                          </button>
                        )}

                        {(responses[response.id]?.type || responseType) === 'link' && (
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="Paste a link..."
                              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                              value={responses[response.id]?.content || ''}
                              onChange={(e) => {
                                setResponses(prev => ({
                                  ...prev,
                                  [response.id]: {
                                    type: 'link',
                                    content: e.target.value,
                                    status: 'draft'
                                  }
                                }));
                              }}
                            />
                          </div>
                        )}

                        {/* Save Button Per Question */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-sm">
                            {responses[response.id]?.status === 'saved' && (
                              <span className="text-green-400 flex items-center gap-1">
                                <CheckCircleIcon className="h-4 w-4" />
                                Saved
                              </span>
                            )}
                            {responses[response.id]?.status === 'saving' && (
                              <span className="text-blue-400">Saving...</span>
                            )}
                          </div>
                          <button
                            onClick={async () => {
                              if (!responses[response.id]?.content) return;
                              
                              setResponses(prev => ({
                                ...prev,
                                [response.id]: {
                                  ...prev[response.id],
                                  status: 'saving'
                                }
                              }));

                              // Simulate API call
                              await new Promise(resolve => setTimeout(resolve, 500));

                              setResponses(prev => ({
                                ...prev,
                                [response.id]: {
                                  ...prev[response.id],
                                  status: 'saved'
                                }
                              }));
                            }}
                            disabled={!responses[response.id]?.content || responses[response.id]?.status === 'saving'}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {responses[response.id]?.status === 'saving' ? 'Saving...' : 'Save Response'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - AI Insights & Progress */}
          <div className="space-y-8">
            {/* AI Insights */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-blue-400" />
                AI Insights
              </h3>
              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.type === 'improvement'
                        ? 'border-green-500 bg-green-500/5'
                        : insight.type === 'achievement'
                        ? 'border-blue-500 bg-blue-500/5'
                        : 'border-yellow-500 bg-yellow-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium">
                        {insight.title}
                      </h4>
                      {insight.metric && (
                        <div className="flex items-center gap-1 text-sm">
                          <span className="font-medium">
                            {insight.metric.current}
                            {insight.metric.unit}
                          </span>
                          <span className={
                            insight.metric.change > 0
                              ? 'text-green-400'
                              : insight.metric.change < 0
                              ? 'text-red-400'
                              : 'text-gray-400'
                          }>
                            ({insight.metric.change > 0 ? '+' : ''}{insight.metric.change})
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress History */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-blue-400" />
                Progress History
              </h3>

              {/* Progress Photos */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-400 mb-4">Progress Photos</h4>
                {mockProgressPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {['front', 'side', 'back'].map((view) => (
                      <div key={view} className="aspect-[3/4] relative">
                        {mockProgressPhotos[0].photos[view] ? (
                          <Image
                            src={mockProgressPhotos[0].photos[view]}
                            alt={`Most recent ${view} view`}
                            fill
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700/30 rounded-lg flex flex-col items-center justify-center">
                            <CameraIcon className="h-8 w-8 text-gray-500 mb-2" />
                            <span className="text-sm text-gray-500 capitalize">{view} view</span>
                  </div>
                )}
                      </div>
                    ))}
                    </div>
                ) : (
                  <div className="bg-gray-700/30 rounded-lg p-6 text-center">
                    <CameraIcon className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">No progress photos submitted yet</p>
                  </div>
                )}
              </div>

              {/* Body Measurements */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-4">Body Measurements</h4>
                {mockMeasurements.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(mockMeasurements[0].measurements).map(([key, value]) => (
                      <div key={key} className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-400 capitalize">{key}</span>
                          {key === 'bodyFat' && (
                            <span className="text-xs text-gray-500">%</span>
                          )}
                          {key === 'weight' && (
                            <span className="text-xs text-gray-500">kg</span>
                          )}
                          {!['bodyFat', 'weight'].includes(key) && (
                            <span className="text-xs text-gray-500">cm</span>
                          )}
                        </div>
                        <div className="text-lg font-medium">{value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-700/30 rounded-lg p-6 text-center">
                    <ScaleIcon className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">No measurements recorded yet</p>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>

        {/* Add the new Weekly Progress Analysis section at the bottom */}
        <div className="grid grid-cols-2 gap-8 mt-8">
          {/* Latest Check-in Summary */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-blue-400" />
              Latest Check-in Summary
            </h3>
                <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-400">
                  Week {checkIn.weekNumber} • {format(new Date(checkIn.date), 'MMM d, yyyy')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  checkIn.score >= 90
                    ? 'bg-green-900/20 text-green-400 border border-green-800/20'
                    : checkIn.score >= 75
                    ? 'bg-blue-900/20 text-blue-400 border border-blue-800/20'
                    : 'bg-yellow-900/20 text-yellow-400 border border-yellow-800/20'
                }`}>
                  Score: {checkIn.score}%
                        </span>
                      </div>
              
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Key Points</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-300">
                      Completed all planned workouts with high intensity
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-300">
                      Sleep quality improved to 7.8 hours average
                        </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ExclamationCircleIcon className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-300">
                      Stress levels slightly elevated due to work
                        </span>
                  </li>
                </ul>
                      </div>

              <div className="bg-gray-700/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Previous Feedback</h4>
                <p className="text-sm text-gray-300">
                  Great work maintaining workout consistency. Focus on implementing the suggested stress management techniques this week. Your sleep improvements are contributing positively to recovery.
                </p>
              </div>
            </div>
          </div>

          {/* Overall Journey Summary */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-blue-400" />
              Overall Journey Summary
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Progress Overview</h4>
                <p className="text-sm text-gray-300">
                  Client has maintained consistent progress over {checkIn.weekNumber} weeks of coaching. Average compliance score of 85% shows strong commitment to the program. Notable improvements in sleep quality and workout consistency.
                </p>
            </div>

              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Key Achievements</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <TrophyIcon className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-300">
                      Increased average sleep duration by 1.2 hours
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrophyIcon className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-300">
                      Achieved 90%+ compliance for 3 consecutive weeks
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrophyIcon className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-300">
                      Established consistent morning routine
                    </span>
                  </li>
                </ul>
                </div>

              <div className="bg-gray-700/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Focus Areas</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-300">
                      Continue building on sleep quality improvements
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-300">
                      Develop additional stress management strategies
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getComplianceColor(score: number) {
  if (score >= 90) return 'text-green-500';
  if (score >= 75) return 'text-yellow-500';
  return 'text-red-500';
} 