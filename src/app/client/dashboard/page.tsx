'use client';

import { useState, useRef, useEffect } from 'react';
import { MainNav } from '@/components/MainNav';
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
} from '@heroicons/react/24/outline';
import ClientProfileCard from './components/ClientProfileCard';
import Link from 'next/link';
import { DailyCheckInsList } from '@/components/dashboard/DailyCheckInsList';
import type { CheckInForm } from '@/types/checkIn';

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

export default function ClientDashboard() {
  const [selectedMetric, setSelectedMetric] = useState(progressData.metrics[0]);
  const [showBeforePhoto, setShowBeforePhoto] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [showReplyOptions, setShowReplyOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURLs, setAudioURLs] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    weeklyResults: true,
    trackingTools: true,
    goalsRoadmap: true,
    coachReview: true,
    progressGallery: true,
    subscription: true,
    timeline: true
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInForm[]>([]);

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

  const handleApprove = () => {
    // Handle approve action
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
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Client Profile */}
            <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 text-center">
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
                <button className="flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors">
                  <PencilSquareIcon className="w-5 h-5 mr-2" />
                  Check In
                </button>
                <button className="flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="relative">
                    Messages
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">3</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Achievements</h2>
                <span className="text-sm text-blue-400">View All</span>
              </div>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.name} className="relative">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        achievement.achieved
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                          : 'bg-gray-700'
                      }`}>
                        <achievement.icon />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white">{achievement.name}</h3>
                        <p className="text-xs text-gray-400">{achievement.description}</p>
                        {!achievement.achieved && (
                          <div className="mt-1 h-1 w-24 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
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
            <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
                <a href="/calendar" className="text-blue-400 hover:text-blue-300 text-sm">View Calendar</a>
              </div>
              <div className="space-y-4">
                {checkIns.map((event) => (
                  <div key={event.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <div className="flex items-center space-x-3 mb-2">
                      {event.title.includes('Check-in') && (
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                      {event.title.includes('Review') && (
                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                      {event.title.includes('Photos') && (
                        <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                      <span className="text-white font-medium">{event.title}</span>
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
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9">
            <div className="grid gap-6">
              {/* Weekly Check-in Results */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleSection('weeklyResults')}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Check-in Results</h2>
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
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Check-in Results</h2>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Last updated 2 days ago</span>
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
                            className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 flex flex-col justify-between border border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600/50 transition-all duration-300 shadow-sm overflow-hidden relative group"
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
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{metric.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{metric.description}</p>
                                  </div>
                                </div>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                                  metric.trend === 'up'
                                    ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10'
                                    : 'text-rose-500 dark:text-rose-400 bg-rose-500/10'
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
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {metric.unit}
                                </span>
                              </div>

                              <div className="flex items-center justify-between mt-2 text-xs">
                                <span className="text-gray-500 dark:text-gray-400">Target: {metric.name === 'Steps' ? 
                                  metric.goal.toLocaleString() : 
                                  metric.goal.toFixed(1)} {metric.unit}</span>
                                <span className={`font-medium ${
                                  progress >= 90 ? 'text-emerald-500 dark:text-emerald-400' :
                                  progress >= 70 ? 'text-amber-500 dark:text-amber-400' :
                                  'text-gray-500 dark:text-gray-400'
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

              {/* Tracking Tools */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleSection('trackingTools')}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tracking Tools</h2>
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
                          className="group relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow overflow-hidden"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`rounded-lg p-3 bg-gradient-to-br ${tool.gradient}`}>
                              <tool.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {tool.name}
                              </h3>
                              <p className="text-sm text-gray-500">{tool.description}</p>
                            </div>
                          </div>
                          {tool.count && (
                            <div className="absolute top-6 right-6 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full text-sm font-medium">
                              {tool.count} photos
                            </div>
                          )}
                          {tool.lastUpdate && (
                            <div className="absolute top-6 right-6 flex items-center gap-1 text-sm text-gray-500">
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

              {/* Goals Roadmap */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleSection('goalsRoadmap')}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Goals Roadmap</h2>
                  </div>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedSections.goalsRoadmap ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <div className={`transition-all duration-200 ${
                  expandedSections.goalsRoadmap ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="p-6 pt-0">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Goals Roadmap</h2>
                        <span className="text-sm text-gray-500 dark:text-gray-400">3 active goals</span>
                      </div>
                      <Link 
                        href="/client/setup"
                        className="text-sm font-medium px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
                      >
                        + New Goal
                      </Link>
                    </div>

                    <div className="space-y-10">
                      {fitnessGoals.map((goal, goalIndex) => {
                        const progress = Math.round(((goal.current - goal.start) / (goal.target - goal.start)) * 100);
                        
                        return (
                          <div key={goalIndex} className="relative">
                            {/* Goal Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${goal.gradient}`}>
                                  <goal.icon className="h-3.5 w-3.5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">{goal.title}</h3>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className="text-gray-500">{goal.start}{goal.unit}</span>
                                    <span className="text-gray-400">→</span>
                                    <span className={`font-medium bg-gradient-to-r ${goal.gradient} bg-clip-text text-transparent`}>
                                      {goal.current}{goal.unit}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-gray-500">{goal.target}{goal.unit}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-1.5">
                                  {goal.milestones.filter(m => m.achieved).map((milestone, idx) => (
                                    <div key={idx} className={`w-5 h-5 rounded-full ring-2 ring-white dark:ring-gray-900 flex items-center justify-center ${
                                      milestone.badge === 'diamond' ? 'bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400' :
                                      milestone.badge === 'gold' ? 'bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400' :
                                      milestone.badge === 'silver' ? 'bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400' :
                                      'bg-gradient-to-br from-amber-700 via-orange-600 to-red-700'
                                    }`}>
                                      <TrophyIcon className="w-2.5 h-2.5 text-white" />
                                    </div>
                                  ))}
                                </div>
                                <span className="text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                                  {progress}%
                                </span>
                              </div>
                            </div>

                            {/* Progress Track */}
                            <div className="relative mt-3">
                              {/* Base Track */}
                              <div className="absolute inset-0 h-2 bg-gray-100 dark:bg-gray-700/50 rounded-full"></div>
                              
                              {/* Progress Bar */}
                              <div 
                                className={`absolute left-0 h-2 rounded-full bg-gradient-to-r ${goal.gradient}`}
                                style={{ width: `${progress}%` }}
                              ></div>

                              {/* Milestone Markers */}
                              <div className="relative h-2 flex justify-between items-center">
                                {goal.milestones.map((milestone, index) => (
                                  <div 
                                    key={index}
                                    className="group relative"
                                    style={{ left: `${(index / (goal.milestones.length - 1)) * 100}%`, marginLeft: '-6px' }}
                                  >
                                    <div className={`w-3 h-3 rounded-full ${
                                      milestone.achieved 
                                        ? `bg-gradient-to-br ${goal.gradient} ring-2 ring-white dark:ring-gray-900` 
                                        : 'bg-gray-200 dark:bg-gray-600'
                                    }`}></div>
                                    
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-2 py-1 text-xs whitespace-nowrap">
                                        <div className="font-medium text-gray-900 dark:text-white">{milestone.value}{goal.unit}</div>
                                        <div className="text-gray-500">{milestone.date}</div>
                                        <div className="flex items-center gap-1">
                                          <span className={milestone.achieved ? 'text-amber-500' : 'text-gray-400'}>
                                            {milestone.reward}
                                          </span>
                                          <span className={`${
                                            milestone.badge === 'diamond' ? 'text-indigo-400' :
                                            milestone.badge === 'gold' ? 'text-amber-400' :
                                            milestone.badge === 'silver' ? 'text-gray-400' :
                                            'text-amber-700'
                                          }`}>
                                            • {milestone.badge}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Goal Button */}
                    <div className="mt-8 flex justify-center">
                      <Link
                        href="/client/setup"
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                      >
                        <PlusIcon className="h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-500" />
                        <span className="text-xs font-medium text-gray-500 group-hover:text-indigo-500">
                          Add Another Goal
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              {/* Smart Insights - Coach Review */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleSection('coachReview')}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BoltIcon className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Coach Review</h2>
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
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-1.5 rounded-lg">
                          <BoltIcon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Coach Review
                          </h2>
                          <p className="text-sm text-gray-500">AI-generated insights pending your review</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
                          onClick={() => {/* Handle playing latest AI message */}}
                        >
                          <MicrophoneIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">Listen to AI Coach</span>
                          {/* Notification badge showing total unheard messages */}
                          <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                            {insights.reduce((total, insight) => total + (insight.audioCount || 0), 0)}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {insights.map((insight, index) => {
                        const gradientColor = insight.type === 'success'
                          ? 'from-emerald-400 via-teal-500 to-cyan-600'
                          : 'from-blue-400 via-indigo-500 to-purple-600';

                        return (
                          <div
                            key={index}
                            className="group bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                          >
                            {/* Status Badge */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                  Pending Review
                                </span>
                                <span className="text-xs text-gray-500">
                                  Generated {new Date().toLocaleDateString()}
                                </span>
                              </div>
                              {insight.hasAudio && (
                                <button 
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors relative"
                                  onClick={() => {/* Handle playing audio */}}
                                >
                                  <MicrophoneIcon className="h-3.5 w-3.5" />
                                  <span className="text-xs font-medium">Listen</span>
                                  {insight.audioCount > 1 && (
                                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full">
                                      {insight.audioCount}
                                    </span>
                                  )}
                                </button>
                              )}
                            </div>

                            <div className="flex items-start gap-4">
                              <div className={`bg-gradient-to-br ${gradientColor} p-2 rounded-lg transform transition-all duration-300 group-hover:scale-110 shadow-lg mt-1`}>
                                {insight.type === 'success' ? (
                                  <ArrowTrendingUpIcon className="h-4 w-4 text-white" />
                                ) : (
                                  <BoltIcon className="h-4 w-4 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-medium text-base text-gray-900 dark:text-white">
                                    {insight.title}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    {insight.metric && (
                                      <span className={`text-sm font-medium px-2 py-1 rounded-lg ${
                                        insight.trend === 'up'
                                          ? 'bg-emerald-500/10 text-emerald-500'
                                          : 'bg-rose-500/10 text-rose-500'
                                      }`}>
                                        {insight.trend === 'up' ? '↑' : '↓'} {Math.abs(insight.change)}
                                        {insight.metric !== 'Energy' && insight.metric !== 'Stress' ? ' ' + insight.metric : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  {insight.description}
                                </p>
                                
                                {/* AI Coach Recommendations */}
                                <div className="mt-4 space-y-3">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Suggested Recommendations:</h4>
                                  <div className="space-y-2">
                                    {insight.recommendations?.map((rec, idx) => (
                                      <div key={idx} className="flex items-start gap-2 text-sm">
                                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div>
                                        <p className="text-gray-600 dark:text-gray-400">{rec}</p>
                                      </div>
                                    )) || (
                                      <div className="text-sm text-gray-500 italic">
                                        AI recommendations loading...
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Coach Response Options */}
                                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Your Response:</h4>
                                    <span className="text-xs text-gray-500">Minimum 10 words required for text</span>
                                  </div>
                                  
                                  {/* Response Layout Container */}
                                  <div className="flex gap-4">
                                    {/* Text Input Area - 2/3 width */}
                                    <div className="w-2/3 relative">
                                      <textarea
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                        className="w-full h-40 px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Type your response here (minimum 10 words)..."
                                      />
                                      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                                        {responseText.trim().split(/\s+/).filter(Boolean).length} words
                                      </div>
                                    </div>

                                    {/* Buttons Stack - 1/3 width */}
                                    <div className="w-1/3 flex flex-col gap-2">
                                      {/* Audio Recording Button */}
                                      <button 
                                        onClick={() => isRecording ? stopRecording() : startRecording()}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                      >
                                        <MicrophoneIcon className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-900">
                                          {isRecording ? 'Stop Recording' : 'Record Audio'}
                                        </span>
                                      </button>

                                      {/* Text Reply Button */}
                                      <button 
                                        onClick={() => handleReplyOption('text')}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                                        disabled={responseText.trim().split(/\s+/).filter(Boolean).length < 10}
                                      >
                                        <ChatBubbleLeftIcon className="h-4 w-4" />
                                        <span className="text-sm font-medium">Text Reply</span>
                                      </button>

                                      {/* Attach File Button */}
                                      <button 
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                      >
                                        <PaperClipIcon className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Attach File</span>
                                      </button>
                                      <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => {
                                          // Handle file upload
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            // Handle the file upload logic here
                                            console.log('File selected:', file);
                                          }
                                        }}
                                      />

                                      {/* Save for Later Button */}
                                      <button className="w-full text-center text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-4 py-2.5">
                                        Save for Later
                                      </button>
                                    </div>
                                  </div>

                                  {/* Audio Recording Section */}
                                  {audioURLs.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                      {audioURLs.map((url, index) => (
                                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <MicrophoneIcon className="h-4 w-4 text-indigo-500" />
                                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Audio Response {audioURLs.length > 1 ? `${index + 1}` : ''}
                                              </span>
                                            </div>
                                            <button
                                              onClick={() => removeAudio(index)}
                                              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                          <audio className="mt-2 w-full" controls src={url} />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* Progress Gallery */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleSection('progressGallery')}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <PhotoIcon className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Progress Gallery</h2>
                  </div>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedSections.progressGallery ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <div className={`transition-all duration-200 ${
                  expandedSections.progressGallery ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="p-6 pt-0">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-1.5 rounded-lg">
                          <PhotoIcon className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                      <span className="text-sm text-gray-600 dark:text-gray-400">Showing last 3 months of progress</span>
                      <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                        Upload New Photo
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment & Subscription */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleSection('subscription')}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription Status</h2>
                  </div>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedSections.subscription ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <div className={`transition-all duration-200 ${
                  expandedSections.subscription ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="p-6 pt-0">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-1.5 rounded-lg">
                          <CreditCardIcon className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Subscription Status
                        </h2>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                        <CheckCircleIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Active</span>
                      </div>
                    </div>

                    {/* Current Payment Method */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                          <CreditCardIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {paymentData.paymentMethod.brand}
                            </span>
                            <span className="text-gray-500">
                              •••• {paymentData.paymentMethod.last4}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Expires {paymentData.paymentMethod.expiryDate}
                          </p>
                        </div>
                      </div>
                      <button className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        Update
                      </button>
                    </div>

                    {/* Next Payment */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Next Payment</span>
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(paymentData.nextPaymentDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ${paymentData.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Recent Invoices */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Recent Invoices
                      </h3>
                      <div className="space-y-3">
                        {paymentData.recentInvoices.map((invoice) => (
                          <div 
                            key={invoice.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <DocumentTextIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {invoice.period}
                                  </span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    invoice.status === 'paid' 
                                      ? 'bg-emerald-500/10 text-emerald-500' 
                                      : 'bg-amber-500/10 text-amber-500'
                                  }`}>
                                    {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {invoice.id}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                ${invoice.amount.toFixed(2)}
                              </span>
                              <button className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timelineHighlights.map((highlight) => (
                    <div 
                      key={highlight.title}
                      className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 flex flex-col justify-between border border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600/50 transition-all duration-300 shadow-sm overflow-hidden relative group"
                    >
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${highlight.gradient}`}>
                              <highlight.icon className="h-3.5 w-3.5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white">{highlight.title}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{highlight.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 