'use client';

import { useState, useRef, useEffect } from 'react';
import { MainNav } from '@/components/MainNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DashboardNav } from '@/components/DashboardNav';
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
} from '@heroicons/react/24/outline';
import ClientProfileCard from './components/ClientProfileCard';
import Link from 'next/link';
import { DailyCheckInsList } from '@/components/dashboard/DailyCheckInsList';
import type { CheckInForm } from '@/types/checkIn';
import ProgressGallery from './components/ProgressGallery';
import FeedbackResponse from '@/components/feedback/FeedbackResponse';
import { AudioMessage, FileAttachment } from '@/types/feedback';

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
      current: 85, 
      previous: 75, 
      unit: '%',
      trend: 'up',
      goal: 100,
      icon: FireIcon,
      description: 'Weekly meal plan compliance'
    },
    { 
      name: 'Training', 
      current: 90, 
      previous: 85, 
      unit: '%',
      trend: 'up',
      goal: 100,
      icon: BoltIcon,
      description: 'Workout completion rate'
    },
    { 
      name: 'Sleep', 
      current: 8.5, 
      previous: 7.8, 
      unit: 'hrs',
      trend: 'up',
      goal: 9,
      icon: HeartIcon,
      description: 'Average sleep duration'
    },
    { 
      name: 'Water', 
      current: 2.8, 
      previous: 2.5, 
      unit: 'L',
      trend: 'up',
      goal: 3,
      icon: ClipboardDocumentCheckIcon,
      description: 'Daily water intake'
    },
    { 
      name: 'Steps', 
      current: 8500, 
      previous: 7200, 
      unit: '',
      trend: 'up',
      goal: 10000,
      icon: ArrowTrendingUpIcon,
      description: 'Daily step count'
    },
    { 
      name: 'Overall', 
      current: 88, 
      previous: 82, 
      unit: '%',
      trend: 'up',
      goal: 100,
      icon: ChartBarIcon,
      description: 'Total weekly compliance'
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
    title: 'Sleep Improving!',
    description: 'Your sleep quality has increased by 0.7 hours this week.',
    type: 'success',
    metric: 'Sleep',
    change: 0.7,
    trend: 'up',
    recommendations: [
      'Maintain your current bedtime routine of 10:30 PM',
      'Consider reducing screen time 30 minutes before bed',
      'Your morning routine is working well - keep it consistent'
    ],
    hasAudio: true,
    audioCount: 2,
  },
  {
    title: 'Stress Management',
    description: 'Your stress levels are trending down. Keep up the good work!',
    type: 'info',
    metric: 'Stress',
    change: -1,
    trend: 'down',
    recommendations: [
      'Continue your daily meditation practice',
      'Schedule regular breaks during work hours',
      'Consider adding an evening walk to your routine'
    ],
    hasAudio: true,
    audioCount: 3,
  },
  {
    title: 'Energy Boost',
    description: 'Your energy levels are up 10% this week!',
    type: 'success',
    metric: 'Energy',
    change: 10,
    trend: 'up',
    recommendations: [
      'Your pre-workout nutrition is working well',
      'Try to maintain consistent meal timing',
      'Consider adding a mid-afternoon protein snack'
    ],
    hasAudio: true,
    audioCount: 1,
  },
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
  const [selectedMetric, setSelectedMetric] = useState(progressData.metrics[0]);
  const [showBeforePhoto, setShowBeforePhoto] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [showReplyOptions, setShowReplyOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURLs, setAudioURLs] = useState<string[]>([]);
  const [acceptedResponses, setAcceptedResponses] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    weeklyResults: true,
    coachReview: false,
    trackingTools: false,
    progressPhotos: false
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

  const startRecording = async () => {
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
        setAudioURLs(prev => [...prev, url]);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const removeAudio = (index: number) => {
    setAudioURLs(prev => prev.filter((_, i) => i !== index));
  };

  const handleReplyOption = (option: string) => {
    if (option === 'text' && responseText.trim().split(/\s+/).length < 10) {
      // You could show a toast/alert here
      return;
    }
    // Handle reply option selection
  };

  const handleAcceptResponse = (insightId: string) => {
    setAcceptedResponses(prev => [...prev, insightId]);
    // Here you would typically make an API call to update the backend
  };

  const handleAcceptSuggestion = (index: number) => {
    setAcceptedSuggestions(prev => {
      const newAccepted = [...prev, index];
      // If all suggestions are accepted, update the review status
      if (newAccepted.length === 3) { // assuming 3 suggestions total
        setReviewStatus('completed');
        // Update localStorage
        const status = {
          checkInId: 'current-checkin',
          allSuggestionsAccepted: true,
          hasNewReview: false
        };
        localStorage.setItem('coachReviewStatus', JSON.stringify(status));
      }
      return newAccepted;
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Client Profile */}
            <div className="bg-gray-800/40 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 text-center shadow-lg">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-gray-800">
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-2xl text-white font-semibold">
                    JS
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">John Smith</h2>
              <p className="text-gray-400 mb-4">Weight Management</p>
              <div className="flex flex-col space-y-3">
                <button className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg text-white font-medium transition-all transform hover:scale-105">
                  <PencilSquareIcon className="w-5 h-5 mr-2" />
                  Check In
                </button>
                <button className="flex items-center justify-center px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-white font-medium transition-all transform hover:scale-105">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2 2v12a2 2 0 012-2h10a2 2 0 012-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="relative">
                    Messages
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">3</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gray-800/40 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Achievements</h2>
                <span className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">View All</span>
              </div>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.name} className="relative group">
                    <div className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 hover:bg-gray-700/30">
                      <div className={`p-2 rounded-lg transform transition-transform duration-300 group-hover:scale-110 ${
                        achievement.achieved
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20'
                          : 'bg-gray-700/50'
                      }`}>
                        <achievement.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{achievement.name}</h3>
                        <p className="text-xs text-gray-400">{achievement.description}</p>
                        {!achievement.achieved && (
                          <div className="mt-1 h-1 w-24 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-gray-800/40 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
                <a href="/calendar" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">View Calendar</a>
              </div>
              <div className="space-y-4">
                {checkIns.map((event) => (
                  <div key={event.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group">
                    <div className="flex items-center space-x-3 mb-2">
                      {event.title.includes('Check-in') && (
                        <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                      )}
                      {event.title.includes('Review') && (
                        <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {event.title.includes('Photos') && (
                        <div className="p-2 rounded-lg bg-pink-500/20 group-hover:bg-pink-500/30 transition-colors">
                          <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      )}
                      <span className="text-white font-medium group-hover:text-blue-400 transition-colors">{event.title}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(event.dueDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                      <svg className="w-4 h-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {event.title.includes('Photos') ? 'Any time' : new Date(event.dueDate).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-gray-800/40 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-white">Subscription</h2>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Active</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">{paymentData.paymentMethod.brand} •••• {paymentData.paymentMethod.last4}</span>
                </div>
                <span className="text-xs text-gray-400">Exp. {paymentData.paymentMethod.expiryDate}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Next Payment</span>
                <div className="flex items-center gap-2">
                  <span className="text-white">${paymentData.amount}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(paymentData.nextPaymentDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              {/* Payment button - shows different states based on payment status */}
              <button
                className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  new Date(paymentData.nextPaymentDate) < new Date()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white cursor-pointer transform hover:scale-105'
                    : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (new Date(paymentData.nextPaymentDate) < new Date()) {
                    /* Payment handler will be implemented */
                  }
                }}
                disabled={new Date(paymentData.nextPaymentDate) >= new Date()}
              >
                <CreditCardIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {new Date(paymentData.nextPaymentDate) < new Date() ? 'Pay Now' : 'Payment Up to Date'}
                </span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9">
            <div className="grid gap-6">
              {/* Weekly Check-in Results */}
              <section className="bg-gray-800/40 rounded-2xl border border-gray-700/50 shadow-lg overflow-hidden">
                <button 
                  onClick={() => toggleSection('weeklyResults')}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-white">Weekly Check-in Results</h2>
                  </div>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedSections.weeklyResults ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <div className={`transition-all duration-200 ${
                  expandedSections.weeklyResults ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="p-6 pt-0">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-white">Weekly Check-in Results</h2>
                        <span className="text-sm text-gray-400">Last updated 2 days ago</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {progressData.metrics.map((metric) => {
                        const progress = Math.min((metric.current / metric.goal) * 100, 100);
                        const gradientStyle = {
                          background: `linear-gradient(to right, 
                            ${metric.name === 'Nutrition' ? 'rgba(249, 115, 22, 0.1)' :
                              metric.name === 'Training' ? 'rgba(245, 158, 11, 0.1)' :
                              metric.name === 'Sleep' ? 'rgba(59, 130, 246, 0.1)' :
                              metric.name === 'Water' ? 'rgba(6, 182, 212, 0.1)' :
                              metric.name === 'Steps' ? 'rgba(16, 185, 129, 0.1)' :
                              'rgba(168, 85, 247, 0.1)'} ${progress}%,
                              transparent ${progress}%)`
                        };
                        
                        return (
                          <div 
                            key={metric.name}
                            style={gradientStyle}
                            className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 flex flex-col justify-between border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 shadow-sm overflow-hidden relative group"
                          >
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${
                                    metric.name === 'Nutrition' ? 'from-orange-500 to-red-600' :
                                    metric.name === 'Training' ? 'from-amber-500 to-orange-600' :
                                    metric.name === 'Sleep' ? 'from-blue-500 to-indigo-600' :
                                    metric.name === 'Water' ? 'from-cyan-500 to-blue-600' :
                                    metric.name === 'Steps' ? 'from-emerald-500 to-teal-600' :
                                    'from-purple-500 to-pink-600'
                                  }`}>
                                    <metric.icon className="h-3.5 w-3.5 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{metric.name}</h3>
                                    <p className="text-xs text-gray-400">{metric.description}</p>
                                  </div>
                                </div>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                                  metric.trend === 'up'
                                    ? 'text-emerald-500 bg-emerald-500/10'
                                    : 'text-rose-500 bg-rose-500/10'
                                }`}>
                                  <span className="font-medium">
                                    {metric.trend === 'up' ? '+' : ''}
                                    {Math.abs(metric.current - metric.previous).toFixed(1)}
                                  </span>
                                  <span>{metric.unit}</span>
                                </div>
                              </div>

                              <div className="flex items-baseline gap-1">
                                <span className={`text-2xl font-bold bg-gradient-to-r ${
                                  metric.name === 'Nutrition' ? 'from-orange-500 to-red-600' :
                                  metric.name === 'Training' ? 'from-amber-500 to-orange-600' :
                                  metric.name === 'Sleep' ? 'from-blue-500 to-indigo-600' :
                                  metric.name === 'Water' ? 'from-cyan-500 to-blue-600' :
                                  metric.name === 'Steps' ? 'from-emerald-500 to-teal-600' :
                                  'from-purple-500 to-pink-600'
                                } bg-clip-text text-transparent`}>
                                  {typeof metric.current === 'number' ? 
                                    metric.name === 'Steps' ? 
                                      metric.current.toLocaleString() : 
                                      metric.current.toFixed(1) 
                                    : metric.current}
                                </span>
                                <span className="text-sm text-gray-400">
                                  {metric.unit}
                                </span>
                              </div>

                              <div className="flex items-center justify-between mt-2 text-xs">
                                <span className="text-gray-400">Target: {metric.name === 'Steps' ? 
                                  metric.goal.toLocaleString() : 
                                  metric.goal.toFixed(1)} {metric.unit}</span>
                                <span className={`font-medium ${
                                  progress >= 90 ? 'text-emerald-500' :
                                  progress >= 70 ? 'text-amber-500' :
                                  'text-gray-400'
                                }`}>{Math.round(progress)}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* Coach's Review Section */}
              <section className="bg-gray-800/40 rounded-2xl border border-gray-700/50 shadow-lg overflow-hidden">
                <button 
                  onClick={() => toggleSection('coachReview')}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-white">Coach's Review</h2>
                  </div>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedSections.coachReview ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <div className={`transition-all duration-200 ${
                  expandedSections.coachReview ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="p-6 pt-0">
                    {/* Review Tabs */}
                    <div className="flex space-x-1 mb-6 bg-gray-800/50 p-1 rounded-lg">
                      {['training', 'nutrition', 'mindset'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveReviewTab(tab)}
                          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                            activeReviewTab === tab
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Filtered Feedback */}
                    <div className="space-y-6">
                      {feedbacks
                        .filter(feedback => feedback.category === activeReviewTab)
                        .map(feedback => (
                          <div key={feedback.id} className="space-y-6">
                            <div className="bg-gray-800/40 rounded-xl p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                                    Pending Review
                                  </div>
                                  <div className="text-gray-400 text-sm">
                                    Generated {new Date(feedback.date).toLocaleDateString('en-US', {
                                      day: 'numeric',
                                      month: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </div>
                                </div>
                                {feedback.hasAudio && (
                                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/30 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                      <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                                      <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                                    </svg>
                                    Listen
                                    {feedback.audioCount > 1 && (
                                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/30 text-xs">
                                        {feedback.audioCount}
                                      </span>
                                    )}
                                  </button>
                                )}
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
                                  <ArrowTrendingUpIcon className="w-6 h-6 text-amber-500" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-xl font-semibold text-white mb-2">{feedback.title}</h3>
                                  <p className="text-gray-300 mb-4">{feedback.content}</p>

                                  <div className="mb-6">
                                    <h4 className="text-sm font-medium text-white mb-3">Suggested Recommendations:</h4>
                                    <div className="space-y-2">
                                      {feedback.suggestions.map((suggestion, index) => (
                                        <div 
                                          key={index}
                                          className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors group"
                                        >
                                          <button 
                                            onClick={() => handleAcceptSuggestion(index)}
                                            className={`flex-shrink-0 p-1 rounded-full ${
                                              acceptedSuggestions.includes(index)
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-gray-600/50 text-gray-400 hover:bg-amber-500/20 hover:text-amber-400'
                                            } transition-colors`}
                                          >
                                            <CheckIcon className="w-4 h-4" />
                                          </button>
                                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                            {suggestion}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-white">Your Response:</h4>
                                    <FeedbackResponse
                                      feedbackId={feedback.id}
                                      onSubmit={(data) => handleFeedbackResponse(feedback.id, data)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Tracking Tools */}
              <section className="bg-gray-800/40 rounded-2xl border border-gray-700/50 shadow-lg overflow-hidden">
                <button 
                  onClick={() => toggleSection('trackingTools')}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-white">Tracking Tools</h2>
                  </div>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedSections.trackingTools ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <div className={`transition-all duration-200 ${
                  expandedSections.trackingTools ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="p-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {trackingTools.map((tool) => (
                        <a
                          key={tool.name}
                          href={tool.href}
                          className="group relative bg-gray-800/50 rounded-xl shadow-sm border border-gray-700/50 p-6 hover:border-gray-600/50 hover:shadow-md transition-all duration-300 overflow-hidden"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`rounded-lg p-3 bg-gradient-to-br ${tool.gradient} transform transition-transform duration-300 group-hover:scale-110`}>
                              <tool.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                {tool.name}
                              </h3>
                              <p className="text-sm text-gray-400">{tool.description}</p>
                            </div>
                          </div>
                          {tool.count && (
                            <div className="absolute top-6 right-6 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-sm font-medium">
                              {tool.count} photos
                            </div>
                          )}
                          {tool.lastUpdate && (
                            <div className="absolute top-6 right-6 flex items-center gap-1 text-sm text-gray-400">
                              <CalendarIcon className="h-4 w-4" />
                              <span>Updated {new Date(tool.lastUpdate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Progress Gallery */}
              <section className="bg-gray-800/40 rounded-2xl border border-gray-700/50 shadow-lg overflow-hidden">
                <button 
                  onClick={() => toggleSection('progressPhotos')}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-white">Progress Gallery</h2>
                  </div>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedSections.progressPhotos ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <div className={`transition-all duration-200 ${
                  expandedSections.progressPhotos ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="p-6 pt-0">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-1.5 rounded-lg">
                          <PhotoIcon className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">
                          Progress Gallery
                        </h2>
                      </div>
                      <button className="text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                        View All Photos
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Latest Photo Card */}
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/images/current-photo.jpg')" }}></div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <span className="text-white text-sm font-medium block">Latest</span>
                          <span className="text-white/80 text-xs">Oct 17, 2023</span>
                        </div>
                      </div>

                      {/* Previous Photos */}
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/images/progress-3.jpg')" }}></div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <span className="text-white text-sm font-medium block">1 Month Ago</span>
                          <span className="text-white/80 text-xs">Sep 17, 2023</span>
                        </div>
                      </div>

                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/images/progress-2.jpg')" }}></div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <span className="text-white text-sm font-medium block">2 Months Ago</span>
                          <span className="text-white/80 text-xs">Aug 17, 2023</span>
                        </div>
                      </div>

                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: "url('/images/progress-1.jpg')" }}></div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <span className="text-white text-sm font-medium block">First Photo</span>
                          <span className="text-white/80 text-xs">Jul 17, 2023</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm text-gray-400">Showing last 3 months of progress</span>
                      <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                        Upload New Photo
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Timeline Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {timelineHighlights.map((highlight) => (
                  <div 
                    key={highlight.title}
                    className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 flex flex-col justify-between border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 shadow-sm overflow-hidden relative group"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${highlight.gradient} transform transition-transform duration-300 group-hover:scale-110`}>
                            <highlight.icon className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{highlight.title}</h3>
                            <p className="text-xs text-gray-400">{highlight.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}