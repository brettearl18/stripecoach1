'use client';

import { 
  UserIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  ArrowPathIcon, 
  ChatBubbleLeftIcon, 
  ClipboardDocumentCheckIcon,
  FireIcon,
  TrophyIcon,
  HeartIcon,
  ScaleIcon,
  StarIcon,
  SparklesIcon,
  VideoCameraIcon,
  ClockIcon,
  CameraIcon,
  BoltIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format, isToday } from 'date-fns';
import { getCoachReviewStatus, setNewCoachReview } from '@/lib/utils/coachReview';
import { useState, useEffect } from 'react';

// This would come from the backend in production
const clientProfile = {
  name: "John Smith",
  profileImage: "/images/placeholder-avatar.jpg",
  programType: "Weight Management",
  stats: {
    checkIns: 24,
    totalSessions: 36,
    consistency: 85,
    daysStreak: 12
  },
  notifications: {
    checkInDue: true,
    unreadMessages: 3
  },
  program: {
    currentWeek: 4,
    totalWeeks: 12,
    phase: "Foundation"
  },
  lastCheckIn: "2024-03-20T10:30:00Z",
  badges: [
    {
      icon: FireIcon,
      name: "30 Day Streak",
      description: "Completed check-ins for 30 consecutive days! Your dedication is paying off.",
      color: "text-orange-500",
      bgColor: "bg-orange-100",
      achieved: true,
      date: "Achieved Mar 15, 2024"
    },
    {
      icon: ScaleIcon,
      name: "10kg Lost",
      description: "Successfully lost 10kg since starting your journey. Amazing transformation!",
      color: "text-green-500",
      bgColor: "bg-green-100",
      achieved: true,
      date: "Achieved Mar 10, 2024"
    },
    {
      icon: HeartIcon,
      name: "Fitness Pro",
      description: "Complete 50 workouts to unlock this badge. Current progress: 35/50",
      color: "text-red-500",
      bgColor: "bg-red-100",
      achieved: false,
      progress: "35/50"
    },
    {
      icon: StarIcon,
      name: "90% Consistency",
      description: "Maintain a 90% program consistency for 4 weeks. Current: 85%",
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      achieved: false,
      progress: "85%"
    },
    {
      icon: TrophyIcon,
      name: "Goal Crusher",
      description: "Reached your first major milestone! Achieved target weight of 75kg.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
      achieved: true,
      date: "Achieved Feb 28, 2024"
    },
    {
      icon: SparklesIcon,
      name: "Early Bird",
      description: "Complete 10 workouts before 7am. Progress: 6/10 morning workouts",
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      achieved: false,
      progress: "6/10"
    }
  ],
  upcomingEvents: [
    {
      id: 1,
      type: "check-in",
      title: "Weekly Check-in",
      date: "2024-03-20",
      time: "09:00 AM",
      icon: ClipboardDocumentCheckIcon,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      id: 2,
      type: "video-call",
      title: "Progress Review",
      date: "2024-03-22",
      time: "02:30 PM",
      icon: VideoCameraIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 3,
      type: "photo-update",
      title: "Progress Photos Due",
      date: "2024-03-25",
      time: "Any time",
      icon: CameraIcon,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ]
};

export default function ClientProfileCard() {
  useEffect(() => {
    // Simulate a pending coach review for testing
    setNewCoachReview('test-checkin-id');
  }, []);

  // Check if check-in is already done for today
  const isCheckInDoneToday = () => {
    const lastCheckIn = localStorage.getItem('lastCheckIn');
    if (!lastCheckIn) return false;
    return isToday(new Date(lastCheckIn));
  };

  // Check if there's a pending coach review
  const getReviewButtonState = () => {
    const status = getCoachReviewStatus();
    if (!status.hasNewReview) return 'none';
    return status.allSuggestionsAccepted ? 'completed' : 'pending';
  };

  // Helper function to format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    }).format(date);
  };

  const reviewStatus = getReviewButtonState();

  return (
    <div className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-800/50">
      <div className="p-4">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="h-20 w-20 rounded-full bg-[#374151] mb-3 overflow-hidden">
            {clientProfile.profileImage ? (
              <img 
                src={clientProfile.profileImage} 
                alt={clientProfile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <UserIcon className="h-10 w-10 text-indigo-400" />
              </div>
            )}
          </div>
          <h2 className="text-lg font-bold text-white">{clientProfile.name}</h2>
          <p className="text-sm text-gray-400 mb-3">{clientProfile.programType}</p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full mb-4">
            <Link 
              href={isCheckInDoneToday() ? "#" : "/client/check-in"}
              className={`relative flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-colors ${
                isCheckInDoneToday()
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
              onClick={(e) => {
                if (isCheckInDoneToday()) {
                  e.preventDefault();
                }
              }}
            >
              <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1.5" />
              {isCheckInDoneToday() ? 'Completed' : 'Check In'}
              {!isCheckInDoneToday() && clientProfile.notifications.checkInDue && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </Link>

            {/* Coach's Review Button */}
            <Link 
              href={reviewStatus === 'none' ? "#" : "/client/reviews"}
              className={`relative flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-colors ${
                reviewStatus === 'none'
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : reviewStatus === 'pending'
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-gray-700 text-gray-400'
              }`}
              onClick={(e) => {
                if (reviewStatus === 'none') {
                  e.preventDefault();
                }
              }}
            >
              <AcademicCapIcon className="h-4 w-4 mr-1.5" />
              Coach's Review
              {reviewStatus === 'pending' && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </Link>

            <Link 
              href="/client/messages"
              className="relative flex items-center justify-center px-3 py-2 text-sm rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-700/50 transition-colors"
            >
              <ChatBubbleLeftIcon className="h-4 w-4 mr-1.5" />
              Messages
              {clientProfile.notifications.unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {clientProfile.notifications.unreadMessages}
                </span>
              )}
            </Link>
          </div>

          {/* Achievement Badges */}
          <div className="w-full mb-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-medium text-white">Achievements</h3>
              <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300">View All</a>
            </div>
            <div className="flex gap-2">
              <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 p-2 rounded-xl">
                <TrophyIcon className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-2 rounded-xl">
                <FireIcon className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-2 rounded-xl">
                <BoltIcon className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 p-2 rounded-xl">
                <HeartIcon className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 p-2 rounded-xl">
                <StarIcon className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 p-2 rounded-xl">
                <ClipboardDocumentCheckIcon className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-white">Upcoming Events</h3>
            <Link href="/client/calendar" className="text-xs text-indigo-400 hover:text-indigo-300">
              View Calendar
            </Link>
          </div>
          <div className="space-y-2">
            {clientProfile.upcomingEvents.map((event) => (
              <div 
                key={event.id}
                className="flex items-center p-2 rounded-lg bg-[#374151] border border-gray-700"
              >
                <div className="p-1.5 rounded-full bg-[#1F2937] mr-2">
                  <event.icon className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">{event.title}</h4>
                  <div className="flex items-center mt-0.5">
                    <CalendarIcon className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-400 mr-2">{formatDate(event.date)}</span>
                    <ClockIcon className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-400 truncate">{event.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex flex-col mb-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Program Progress - {clientProfile.program.phase} Phase</span>
              <span>Week {clientProfile.program.currentWeek}/{clientProfile.program.totalWeeks}</span>
            </div>
            <p className="text-xs text-gray-400">
              {clientProfile.program.totalWeeks - clientProfile.program.currentWeek} weeks remaining
            </p>
          </div>
          <div className="w-full bg-[#374151] rounded-full h-1.5">
            <div 
              className="bg-indigo-600 h-1.5 rounded-full" 
              style={{ width: `${(clientProfile.program.currentWeek / clientProfile.program.totalWeeks) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#374151] rounded-lg p-3">
            <div className="flex items-center mb-1">
              <CalendarIcon className="h-4 w-4 text-indigo-400 mr-1.5" />
              <span className="text-xs text-gray-400">Check-ins</span>
            </div>
            <p className="text-lg font-bold text-white">{clientProfile.stats.checkIns}</p>
          </div>

          <div className="bg-[#374151] rounded-lg p-3">
            <div className="flex items-center mb-1">
              <ChartBarIcon className="h-4 w-4 text-indigo-400 mr-1.5" />
              <span className="text-xs text-gray-400">Consistency</span>
            </div>
            <p className="text-lg font-bold text-white">{clientProfile.stats.consistency}%</p>
          </div>

          <div className="bg-[#374151] rounded-lg p-3 col-span-2">
            <div className="flex items-center mb-1">
              <ArrowPathIcon className="h-4 w-4 text-indigo-400 mr-1.5" />
              <span className="text-xs text-gray-400">Current Streak</span>
            </div>
            <p className="text-lg font-bold text-white">{clientProfile.stats.daysStreak} days</p>
          </div>
        </div>
      </div>
    </div>
  );
} 