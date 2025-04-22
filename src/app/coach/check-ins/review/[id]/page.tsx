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
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { format } from 'date-fns';
import { mockCheckIn } from './mockCheckIn';

interface ResponseComment {
  type: 'text' | 'audio';
  content: string;
  timestamp: string;
}

interface CheckInData {
  id: string;
  clientName: string;
  clientAvatar: string;
  date: string;
  type: string;
  status: 'pending' | 'reviewed' | 'completed';
  responses: {
    [key: string]: {
      category: string;
      question: string;
      answer: string | number | string[];
      type: 'text' | 'rating_scale' | 'photo' | 'multiple_choice';
      score: number;
      coachComment?: ResponseComment;
    };
  };
  metrics: {
    [key: string]: {
      value: number;
      unit: string;
      change: number;
    };
  };
  photos: { url: string }[];
  previousCheckIn: {
    metrics: {
      [key: string]: {
        value: number;
      };
    };
  };
  overallScore: {
    current: number;
    previous: number;
  };
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

export default function CheckInReview() {
  const params = useParams();
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={checkIn.clientAvatar}
                alt={checkIn.clientName}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {checkIn.clientName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {checkIn.type} • Submitted {format(new Date(checkIn.date), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (!feedback && !recordedAudio)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Client Data */}
          <div className="col-span-2 space-y-6">
            {/* Compliance Scores */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Metrics Overview
                </h2>
                <div className="grid grid-cols-4 gap-6">
                  {/* Overall Score */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Overall Score
                    </div>
                    <div className="mt-1 flex items-baseline">
                      <div className={`text-2xl font-semibold ${getComplianceColor(checkIn.overallScore.current)}`}>
                        {checkIn.overallScore.current.toFixed(1)}%
                      </div>
                      <div className={`ml-2 text-sm font-medium ${
                        checkIn.overallScore.current - checkIn.overallScore.previous > 0 
                          ? 'text-green-500' 
                          : checkIn.overallScore.current - checkIn.overallScore.previous < 0 
                            ? 'text-red-500' 
                            : 'text-gray-500'
                      }`}>
                        {(checkIn.overallScore.current - checkIn.overallScore.previous > 0 ? '+' : '')}
                        {(checkIn.overallScore.current - checkIn.overallScore.previous).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  {/* Existing metrics */}
                  {Object.entries(checkIn.metrics).map(([key, metric]) => {
                    const previousValue = checkIn.previousCheckIn.metrics[key as keyof typeof checkIn.metrics].value;
                    const change = getMetricChange(metric.value, previousValue);
                    return (
                      <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                          {key}
                        </div>
                        <div className="mt-1 flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {metric.value}
                          </div>
                          <div className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            {metric.unit}
                          </div>
                          <div className={`ml-2 text-sm font-medium ${change.color}`}>
                            {change.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Check-in History Calendar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                    Check-in History
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Last {mockCheckInHistory.length} weeks
                    </div>
                    <Link
                      href={`/coach/check-ins/history/${checkIn.clientId}`}
                      className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                    >
                      View All
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 opacity-20"></div>
                    <span>90%+</span>
                    <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-20"></div>
                    <span>75-89%</span>
                    <div className="w-4 h-4 rounded-full bg-red-500 opacity-20"></div>
                    <span>&lt;75%</span>
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                    <span>Missed</span>
                  </div>
                  <div className="grid grid-cols-7 gap-4">
                    {mockCheckInHistory.map((checkIn, index) => (
                      <div
                        key={index}
                        className={`relative flex flex-col items-center p-4 rounded-lg ${
                          checkIn.status === 'missed'
                            ? 'border-2 border-gray-300 dark:border-gray-600'
                            : checkIn.score >= 90
                            ? 'bg-green-50 dark:bg-green-500/5'
                            : checkIn.score >= 75
                            ? 'bg-yellow-50 dark:bg-yellow-500/5'
                            : 'bg-red-50 dark:bg-red-500/5'
                        }`}
                      >
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Week {checkIn.week}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {format(new Date(checkIn.date), 'MMM d')}
                        </div>
                        {checkIn.status !== 'missed' && (
                          <div className={`text-sm font-medium mt-1 ${getComplianceColor(checkIn.score)}`}>
                            {checkIn.score}%
                          </div>
                        )}
                        {checkIn.status === 'missed' && (
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                            Missed
                          </div>
                        )}
                        <Link
                          href={`/coach/check-ins/review/check-${checkIn.week}`}
                          className={`absolute inset-0 rounded-lg transition-colors ${
                            checkIn.status === 'missed'
                              ? 'hover:border-gray-400 dark:hover:border-gray-500'
                              : 'hover:opacity-75'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Client Responses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Check-in Responses
                </h2>
                <div className="space-y-8">
                  {Object.entries(CHECK_IN_QUESTIONS).map(([category, questions]) => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 capitalize border-b border-gray-200 dark:border-gray-700 pb-2">
                        {category}
                      </h3>
                      <div className="space-y-6">
                        {questions.map((data) => (
                          <div key={data.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {data.question}
                              </h4>
                              <span className={`text-sm font-medium ${getComplianceColor(data.score)}`}>
                                {data.score}%
                              </span>
                            </div>
                            <p className="text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                              {data.answer}
                            </p>
                            
                            {/* Coach Response Section */}
                            <div className="mt-2 space-y-2">
                              {responseComments[data.id] && (
                                <div className="flex items-start space-x-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                  {responseComments[data.id].type === 'audio' ? (
                                    <div className="flex items-center space-x-2">
                                      <PlayIcon className="h-5 w-5 text-blue-500" />
                                      <span className="text-sm text-blue-600 dark:text-blue-400">Voice note</span>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                      {responseComments[data.id].content}
                                    </p>
                                  )}
                                  <button
                                    onClick={() => {
                                      const newComments = { ...responseComments };
                                      delete newComments[data.id];
                                      setResponseComments(newComments);
                                    }}
                                    className="text-blue-500 hover:text-blue-600"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                              
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  className="flex-1 px-3 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && e.currentTarget.value) {
                                      setResponseComments(prev => ({
                                        ...prev,
                                        [data.id]: {
                                          type: 'text',
                                          content: e.currentTarget.value,
                                          timestamp: new Date().toISOString()
                                        }
                                      }));
                                      e.currentTarget.value = '';
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    if (isRecordingComment === data.id) {
                                      stopRecording();
                                      setIsRecordingComment(null);
                                    } else {
                                      startRecording();
                                      setIsRecordingComment(data.id);
                                    }
                                  }}
                                  className={`p-2 rounded-lg ${
                                    isRecordingComment === data.id
                                      ? 'bg-red-500 text-white'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                  }`}
                                >
                                  <MicrophoneIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Photos */}
            {checkIn.photos.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Progress Photos
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {checkIn.photos.map((photo, index) => (
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
            )}
          </div>

          {/* Right Column - Coach Response */}
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-blue-500" />
                  AI Insights
                </h2>
                <div className="space-y-4">
                  {mockAIInsights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.type === 'improvement'
                          ? 'border-green-500 bg-green-50 dark:bg-green-500/5'
                          : insight.type === 'achievement'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/5'
                          : insight.type === 'attention'
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-500/5'
                          : 'border-purple-500 bg-purple-50 dark:bg-purple-500/5'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {insight.title}
                        </h3>
                        {insight.metric && (
                          <div className="flex items-center gap-1 text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {insight.metric.current}
                            </span>
                            <span className={`${
                              insight.metric.change > 0
                                ? 'text-green-500'
                                : insight.metric.change < 0
                                ? 'text-red-500'
                                : 'text-gray-500'
                            }`}>
                              ({insight.metric.change > 0 ? '+' : ''}{insight.metric.change})
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {insight.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Response Type Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Response Type
                </h2>
                <div className="grid grid-cols-4 gap-4">
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
                  <button
                    onClick={() => setResponseType('link')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                      responseType === 'link'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <PaperClipIcon className="h-6 w-6 text-gray-400" />
                    <span className="mt-2 text-sm font-medium">Link</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Response Input */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Your Response
                </h2>
                {responseType === 'text' && (
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your feedback..."
                  />
                )}
                {responseType === 'audio' && (
                  <div className="space-y-4">
                    {recordedAudio ? (
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                          <MicrophoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Audio recorded
                          </span>
                        </div>
                        <button
                          onClick={() => setRecordedAudio(null)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-full flex items-center justify-center gap-2 p-4 rounded-lg border ${
                          isRecording
                            ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-500'
                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <MicrophoneIcon className="h-5 w-5" />
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                      </button>
                    )}
                  </div>
                )}
                {responseType === 'video' && (
                  <div className="flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      <VideoCameraIcon className="h-5 w-5" />
                      Record Video
                    </button>
                  </div>
                )}
                {responseType === 'link' && (
                  <div className="space-y-4">
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="Enter URL..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          if (linkUrl) {
                            setFeedback(prev => prev ? `${prev}\n${linkUrl}` : linkUrl);
                            setLinkUrl('');
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Add Link
                      </button>
                    </div>
                  </div>
                )}
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
                        <XMarkIcon className="h-5 w-5" />
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
                          setSelectedTasks(prev => [...prev, customTask.trim()]);
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

function getComplianceColor(score: number) {
  if (score >= 90) return 'text-green-500';
  if (score >= 75) return 'text-yellow-500';
  return 'text-red-500';
}

function getMetricChange(current: number, previous: number) {
  const change = current - previous;
  if (change > 0) return { text: `+${change.toFixed(1)}`, color: 'text-green-500' };
  if (change < 0) return { text: change.toFixed(1), color: 'text-red-500' };
  return { text: '0', color: 'text-gray-500' };
} 