'use client';

import { useState, useRef, useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  CalendarIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  FireIcon,
  TrophyIcon,
  HeartIcon,
  ScaleIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon,
  PlusIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
  PaperClipIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  VideoCameraIcon,
  XMarkIcon,
  CheckIcon,
  XCircleIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  LightBulbIcon,
  ChevronDownIcon,
  FaceSmileIcon,
  AcademicCapIcon,
  PlayIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import ClientProfileCard from './components/ClientProfileCard';
import Link from 'next/link';
import { DailyCheckInsList } from '@/components/dashboard/DailyCheckInsList';
import type { CheckInForm } from '@/types/checkIn';
import ProgressGallery from './components/ProgressGallery';
import FeedbackResponse from '@/components/feedback/FeedbackResponse';
import { AudioMessage, FileAttachment } from '@/types/feedback';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { getClientProfile } from '@/lib/services/clientProfileService';

// Temporary data - would come from backend in real app
const timelineHighlights = [
  {
    type: 'photo',
    title: 'Progress Photo Added',
    description: 'Monthly progress photo uploaded',
    date: 'Oct 17, 2023',
    icon: PhotoIcon,
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
  },
  {
    type: 'achievement',
    title: 'Achievement Unlocked',
    description: 'Earned "Consistency Champion" badge',
    date: 'Oct 15, 2023',
    icon: TrophyIcon,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
  },
  {
    type: 'checkin',
    title: 'Weekly Check-in',
    description: 'Sleep quality improved by 0.7 hours',
    date: 'Oct 14, 2023',
    icon: ClipboardDocumentCheckIcon,
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
  },
  {
    type: 'milestone',
    title: 'Goal Reached',
    description: 'Completed 4 weeks training streak',
    date: 'Oct 10, 2023',
    icon: FireIcon,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
];

const progressData = {
  streak: 12,
  totalPoints: 780,
  level: 4,
  nextLevelPoints: 1000,
  weeklyProgress: [
    { name: 'Mon', completed: true },
    { name: 'Tue', completed: true },
    { name: 'Wed', completed: true },
    { name: 'Thu', completed: false },
    { name: 'Fri', completed: false },
    { name: 'Sat', completed: false },
    { name: 'Sun', completed: false },
  ],
  metrics: [
    {
      name: 'Nutrition',
      description: 'Daily Calories',
      current: 2200,
      previous: 2000,
      goal: 2500,
      unit: 'kcal',
      trend: 'up',
      icon: LightBulbIcon
    },
    {
      name: 'Training',
      description: 'Weekly Sessions',
      current: 4,
      previous: 3,
      goal: 5,
      unit: '',
      trend: 'up',
      icon: ClipboardDocumentCheckIcon
    },
    {
      name: 'Sleep',
      description: 'Average Hours',
      current: 7,
      previous: 6.5,
      goal: 8,
      unit: 'hrs',
      trend: 'up',
      icon: MicrophoneIcon
    },
    {
      name: 'Water',
      description: 'Daily Intake',
      current: 2.5,
      previous: 2,
      goal: 3,
      unit: 'L',
      trend: 'up',
      icon: CheckIcon
    },
    {
      name: 'Steps',
      description: 'Daily Average',
      current: 8000,
      previous: 7500,
      goal: 10000,
      unit: '',
      trend: 'up',
      icon: ArrowTrendingUpIcon
    },
    {
      name: 'Overall',
      description: 'Progress Score',
      current: 85,
      previous: 75,
      goal: 100,
      unit: '%',
      trend: 'up',
      icon: ChatBubbleLeftRightIcon
    }
  ],
};

// Mock achievements data
const achievements = [
  {
    name: 'Consistency Champion',
    description: '7-day check-in streak',
    icon: () => (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    progress: 100,
    achieved: true,
    points: 500
  },
  {
    name: 'Goal Crusher',
    description: 'Hit your weekly targets',
    icon: () => (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    progress: 85,
    achieved: false,
    points: 300
  },
  {
    name: 'Early Bird',
    description: 'Complete check-ins before 9am',
    icon: () => (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
      </svg>
    ),
    progress: 60,
    achieved: false,
    points: 200
  }
];

const insights = [
  {
    title: 'Nutrition Progress',
    description: 'Your protein intake has improved significantly this week.',
    trend: 'up',
    recommendations: [
      'Keep maintaining high protein meals',
      'Consider adding a post-workout shake',
      'Track your macros consistently'
    ],
    hasAudio: true,
    audioCount: 2
  },
  {
    title: 'Training Adaptation',
    description: 'Your strength gains are showing steady progress.',
    trend: 'up',
    recommendations: [
      'Increase weight on compound lifts',
      'Maintain current rest periods',
      'Focus on form during progression'
    ],
    hasAudio: false
  }
];

// Add new goals data structure
const fitnessGoals = [
  {
    type: 'weight',
    title: 'Target Weight',
    start: 85,
    current: 80,
    target: 75,
    unit: 'kg',
    milestones: [
      { value: 82, achieved: true, reward: '+100 pts', date: 'Sep 15', badge: 'bronze' },
      { value: 80, achieved: true, reward: '+150 pts', date: 'Oct 1', badge: 'silver' },
      { value: 77, achieved: false, reward: '+200 pts', date: 'Target', badge: 'gold' },
      { value: 75, achieved: false, reward: '+300 pts', date: 'Final Goal', badge: 'diamond' },
    ],
    icon: ScaleIcon,
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
  },
  {
    type: 'strength',
    title: 'Bench Press',
    start: 60,
    current: 75,
    target: 100,
    unit: 'kg',
    milestones: [
      { value: 70, achieved: true, reward: '+100 pts', date: 'Sep 10', badge: 'bronze' },
      { value: 75, achieved: true, reward: '+150 pts', date: 'Oct 5', badge: 'silver' },
      { value: 85, achieved: false, reward: '+200 pts', date: 'Target', badge: 'gold' },
      { value: 100, achieved: false, reward: '+300 pts', date: 'Final Goal', badge: 'diamond' },
    ],
    icon: BoltIcon,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
  },
  {
    type: 'stress',
    title: 'Stress Level',
    start: 8,
    current: 5,
    target: 3,
    unit: '/10',
    milestones: [
      { value: 6, achieved: true, reward: '+100 pts', date: 'Sep 20', badge: 'bronze' },
      { value: 5, achieved: true, reward: '+150 pts', date: 'Oct 10', badge: 'silver' },
      { value: 4, achieved: false, reward: '+200 pts', date: 'Target', badge: 'gold' },
      { value: 3, achieved: false, reward: '+300 pts', date: 'Final Goal', badge: 'diamond' },
    ],
    icon: ChartBarIcon,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
];

// Add payment data after other const data
const paymentData = {
  subscriptionStatus: 'active',
  nextPaymentDate: '2024-03-15',
  amount: 99.99,
  paymentMethod: {
    type: 'card',
    last4: '4242',
    expiryDate: '05/25',
    brand: 'Visa',
  },
  recentInvoices: [
    {
      id: 'INV-2024-002',
      date: '2024-02-15',
      amount: 99.99,
      status: 'paid',
      period: 'Feb 15 - Mar 14',
    },
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      amount: 99.99,
      status: 'paid',
      period: 'Jan 15 - Feb 14',
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-15',
      amount: 99.99,
      status: 'paid',
      period: 'Dec 15 - Jan 14',
    },
  ],
};

// Add this after the other data constants
const trackingTools = [
  {
    name: 'Goals & Milestones',
    description: 'Set and track your fitness goals',
    href: '/client/setup',
    icon: TrophyIcon,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    count: 3, // Active goals
  },
  {
    name: 'Progress Photos',
    description: 'Upload and track your transformation',
    href: '/client/photos',
    icon: PhotoIcon,
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    count: 12, // Total photos
  },
  {
    name: 'Body Measurements',
    description: 'Log and monitor your measurements',
    href: '/client/measurements',
    icon: ScaleIcon,
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    lastUpdate: '2024-03-15',
  }
];

// Quick response templates
const quickResponses = [
  { emoji: "💪", text: "Great progress this week!" },
  { emoji: "🎯", text: "Keep focusing on your goals" },
  { emoji: "📈", text: "I see improvement in your metrics" },
  { emoji: "🔄", text: "Let's adjust your program" },
];

export default function ClientDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState(progressData.metrics[0]);
  const [showBeforePhoto, setShowBeforePhoto] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [showReplyOptions, setShowReplyOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURLs, setAudioURLs] = useState<string[]>([]);
  const [acceptedResponses, setAcceptedResponses] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    insights: true,
    progress: true,
    review: true
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInForm[]>([]);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<number[]>([]);
  const [reviewStatus, setReviewStatus] = useState('pending'); // 'none' | 'pending' | 'completed'
  const [activeReviewTab, setActiveReviewTab] = useState('training');
  const [feedbacks, setFeedbacks] = useState([
    {
      id: '1',
      category: 'training',
      coachName: 'Coach Alex',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Training Progress!',
      content: 'Your form has improved significantly this week. Keep focusing on controlled movements.',
      status: 'pending',
      metric: {
        name: 'Form',
        change: 0.8,
        unit: 'points'
      },
      hasAudio: true,
      audioCount: 2,
      suggestions: [
        'Focus on eccentric phase of lifts',
        'Maintain current warm-up routine',
        'Add mobility work between sets'
      ]
    },
    {
      id: '2',
      category: 'nutrition',
      coachName: 'Coach Alex',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Protein Goals Met!',
      content: 'Great job hitting your protein targets consistently this week. Your meal timing has also improved.',
      status: 'pending',
      metric: {
        name: 'Protein',
        change: 15,
        unit: 'g'
      },
      hasAudio: true,
      audioCount: 1,
      suggestions: [
        'Continue with current protein intake',
        'Try to add more green vegetables to lunch',
        'Consider having a small pre-workout snack'
      ]
    },
    {
      id: '3',
      category: 'mindset',
      coachName: 'Coach Alex',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Sleep Improving!',
      content: 'Your sleep quality has increased by 0.7 hours this week.',
      status: 'pending',
      metric: {
        name: 'Sleep',
        change: 0.7,
        unit: 'hrs'
      },
      hasAudio: true,
      audioCount: 2,
      suggestions: [
        'Maintain your current bedtime routine of 10:30 PM',
        'Consider reducing screen time 30 minutes before bed',
        'Your morning routine is working well - keep it consistent'
      ]
    }
  ]);

  const [isRecordingResponse, setIsRecordingResponse] = useState(false);
  const [responseAudioURL, setResponseAudioURL] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioURLs(prev => [...prev, audioUrl]);
          chunksRef.current = [];
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    }
  };

  const handleAcceptResponse = (index: number) => {
    setAcceptedResponses(prev => [...prev, `response-${index}`]);
  };

  const handleReply = (feedbackId: string, content: string, audioUrl?: string) => {
    setFeedbacks(prevFeedbacks => 
      prevFeedbacks.map(feedback => {
        if (feedback.id === feedbackId) {
          return {
            ...feedback,
            replies: [
              ...(feedback.replies || []),
              {
                id: `${feedbackId}-${Date.now()}`,
                content,
                date: new Date().toISOString(),
                isClient: true,
                hasAudio: !!audioUrl,
                audioUrl
              }
            ]
          };
        }
        return feedback;
      })
    );
  };

  const handleReact = (feedbackId: string, reaction: string) => {
    // Implement reaction handling logic here
    console.log(`Reacted to feedback ${feedbackId} with ${reaction}`);
  };

  const startResponseRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setResponseAudioURL(url);
      };

      mediaRecorder.start();
      setIsRecordingResponse(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopResponseRecording = () => {
    if (mediaRecorderRef.current && isRecordingResponse) {
      mediaRecorderRef.current.stop();
      setIsRecordingResponse(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles(Array.from(event.target.files));
    }
  };

  const handleFeedbackResponse = async (feedbackId: string, data: {
    content?: string;
    audioMessage?: AudioMessage;
    attachments?: FileAttachment[];
    isAgreed: boolean;
  }) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit response');
      }

      // Update local state to reflect the response
      setFeedbacks(prevFeedbacks => 
        prevFeedbacks.map(feedback => {
          if (feedback.id === feedbackId) {
            return {
              ...feedback,
              status: data.isAgreed ? 'completed' : 'reviewed'
            };
          }
          return feedback;
        })
      );

      // Show success message or update UI as needed
    } catch (error) {
      console.error('Error submitting feedback response:', error);
      // Handle error (show error message, etc.)
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const auth = getAuth();
      if (auth.currentUser) {
        const clientProfile = await getClientProfile(auth.currentUser.uid);
        setProfile(clientProfile);
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  useEffect(() => {
    // Mock data for upcoming events
    const mockCheckIns: CheckInForm[] = [
      {
        id: 'weekly-checkin-1',
        title: 'Weekly Check-in',
        description: 'Regular weekly check-in',
        questions: [],
        status: 'pending',
        dueDate: '2024-03-20T09:00:00.000Z',
        answers: [],
        clientId: 'test-client',
        templateId: 'weekly-checkin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'progress-review-1',
        title: 'Progress Review',
        description: 'Monthly progress review session',
        questions: [],
        status: 'pending',
        dueDate: '2024-03-22T14:30:00.000Z',
        answers: [],
        clientId: 'test-client',
        templateId: 'progress-review',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'photos-due-1',
        title: 'Progress Photos Due',
        description: 'Submit your progress photos',
        questions: [],
        status: 'pending',
        dueDate: '2024-03-25T23:59:59.000Z',
        answers: [],
        clientId: 'test-client',
        templateId: 'photos',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    setCheckIns(mockCheckIns);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-blue-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCircleIcon className="h-12 w-12 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Welcome!</h1>
            <p className="text-gray-400 text-lg mb-2">Let's set up your profile</p>
            <p className="text-gray-500 text-sm">Complete your profile to unlock personalized coaching, progress tracking, and nutrition guidance.</p>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-4 flex items-start space-x-4">
              <div className="bg-green-500/10 rounded-lg p-2">
                <ChartBarIcon className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-gray-200 font-medium mb-1">Track Your Progress</h3>
                <p className="text-gray-500 text-sm">Monitor your fitness journey with detailed metrics and insights</p>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 flex items-start space-x-4">
              <div className="bg-purple-500/10 rounded-lg p-2">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-gray-200 font-medium mb-1">Personal Coaching</h3>
                <p className="text-gray-500 text-sm">Get tailored advice and feedback from your dedicated coach</p>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 flex items-start space-x-4">
              <div className="bg-orange-500/10 rounded-lg p-2">
                <ClipboardDocumentCheckIcon className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-gray-200 font-medium mb-1">Nutrition Guidance</h3>
                <p className="text-gray-500 text-sm">Access meal plans and track your nutrition goals</p>
              </div>
            </div>
          </div>
          
          <Link
            href="/client/profile/setup"
            className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-lg text-center font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-blue-500/25"
          >
            Set Up Your Profile
          </Link>
          
          <p className="text-center text-gray-500 text-sm mt-6">
            This will only take a few minutes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ClientProfileCard />
        
        {/* AI Insights Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => toggleSection('insights')}
            className="w-full px-6 py-4 flex items-center justify-between text-gray-100 hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <AcademicCapIcon className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold">AI Insights</h2>
            </div>
            <ChevronDownIcon
              className={`h-6 w-6 transform transition-transform ${
                expandedSections.insights ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSections.insights && (
            <div className="p-6 space-y-6">
              {insights.map((insight, index) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-100">{insight.title}</h3>
                      <p className="text-gray-300 mt-1">{insight.description}</p>
                    </div>
                    {insight.hasAudio && (
                      <div className="flex items-center space-x-2">
                        <PlayIcon className="h-5 w-5 text-blue-500" />
                        <span className="text-sm text-gray-300">{insight.audioCount}</span>
                      </div>
                    )}
                  </div>
                  <ul className="mt-4 space-y-2">
                    {insight.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-gray-300">
                        <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Check-in Results */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => toggleSection('progress')}
            className="w-full px-6 py-4 flex items-center justify-between text-gray-100 hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold">Weekly Check-in Results</h2>
            </div>
            <ChevronDownIcon
              className={`h-6 w-6 transform transition-transform ${
                expandedSections.progress ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSections.progress && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressData.metrics.map((metric, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <metric.icon className="h-5 w-5 text-blue-500" />
                        <h3 className="font-medium text-gray-100">{metric.name}</h3>
                      </div>
                      {metric.trend === 'up' && (
                        <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{metric.description}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Current</span>
                        <span className="text-gray-100">{metric.current}{metric.unit}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-300">Goal</span>
                        <span className="text-gray-100">{metric.goal}{metric.unit}</span>
                      </div>
                    </div>
                    <div className="mt-2 h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${(metric.current / metric.goal) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coach's Review Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => toggleSection('review')}
            className="w-full px-6 py-4 flex items-center justify-between text-gray-100 hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ChatBubbleLeftIcon className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold">Coach's Review</h2>
            </div>
            <ChevronDownIcon
              className={`h-6 w-6 transform transition-transform ${
                expandedSections.review ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSections.review && (
            <div className="p-6">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-100">Weekly Progress Review</h3>
                      <span className="text-sm text-gray-400">2 days ago</span>
                    </div>
                    <p className="mt-2 text-gray-300">
                      Great progress this week! Your consistency with workouts is showing in your strength gains. 
                      Keep focusing on protein intake and recovery. Let's work on increasing your daily steps gradually.
                    </p>
                    <div className="mt-4 flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-gray-100">
                        <PaperClipIcon className="h-5 w-5" />
                        <span>View Detailed Report</span>
                      </button>
                      <button className="flex items-center space-x-2 text-sm text-gray-300 hover:text-gray-100">
                        <ChatBubbleLeftIcon className="h-5 w-5" />
                        <span>Reply to Coach</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}