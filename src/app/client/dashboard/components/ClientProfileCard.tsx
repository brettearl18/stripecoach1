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
import { getClientProfile, ExtendedClientProfile } from '@/lib/services/clientProfileService';
import { getAuth } from 'firebase/auth';

export default function ClientProfileCard() {
  const [profile, setProfile] = useState<ExtendedClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        const profileData = await getClientProfile(user.uid);
        if (profileData) {
          setProfile(profileData);
        }
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  // Check if check-in is already done for today
  const isCheckInDoneToday = () => {
    if (!profile?.lastCheckIn) return false;
    return isToday(new Date(profile.lastCheckIn));
  };

  // Check if there's a pending coach review
  const getReviewButtonState = () => {
    const status = getCoachReviewStatus();
    if (!status.hasNewReview) return 'none';
    return status.allSuggestionsAccepted ? 'completed' : 'pending';
  };

  const reviewStatus = getReviewButtonState();

  if (loading) {
    return (
      <div className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-800/50 p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-gray-700 mb-3"></div>
          <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-800/50 p-4">
        <div className="flex flex-col items-center">
          <UserIcon className="h-20 w-20 text-gray-600 mb-3" />
          <p className="text-gray-400">Profile not found</p>
          <Link 
            href="/client/profile/setup"
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Complete Profile Setup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-800/50">
      <div className="p-4">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="h-20 w-20 rounded-full bg-[#374151] mb-3 overflow-hidden">
            {profile.profileImage ? (
              <img 
                src={profile.profileImage} 
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <UserIcon className="h-10 w-10 text-indigo-400" />
              </div>
            )}
          </div>
          <h2 className="text-lg font-bold text-white">{profile.name}</h2>
          <p className="text-sm text-gray-400 mb-3">{profile.programType}</p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full mb-4">
            <Link 
              href={isCheckInDoneToday() ? "#" : "/client/check-in"}
              className={`relative flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-colors ${
                isCheckInDoneToday()
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
              {isCheckInDoneToday() ? 'Check-in Completed' : 'Daily Check-in'}
              {!isCheckInDoneToday() && profile.notifications.checkInDue && (
                <span className="absolute -top-1 -right-1 h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </Link>

            <Link
              href="/client/messages"
              className="relative flex items-center justify-center px-3 py-2 text-sm bg-gray-700/50 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
              Messages
              {profile.notifications.unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
                  {profile.notifications.unreadMessages}
                </span>
              )}
            </Link>

            {reviewStatus !== 'none' && (
              <Link
                href="/client/review"
                className={`flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-colors ${
                  reviewStatus === 'completed'
                    ? 'bg-emerald-600/20 text-emerald-400'
                    : 'bg-amber-600/20 text-amber-400'
                }`}
              >
                <AcademicCapIcon className="h-4 w-4 mr-2" />
                {reviewStatus === 'completed' ? 'Review Complete' : 'Coach Review Available'}
              </Link>
            )}
          </div>

          {/* Program Progress */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Program Progress - {profile.program.phase} Phase</span>
              <span>Week {profile.program.currentWeek}/{profile.program.totalWeeks}</span>
            </div>
            <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${(profile.program.currentWeek / profile.program.totalWeeks) * 100}%` }}>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-right">
              {profile.program.totalWeeks - profile.program.currentWeek} weeks remaining
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 w-full mt-6">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{profile.stats.checkIns}</p>
              <p className="text-xs text-gray-400">Check-ins</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{profile.stats.consistency}%</p>
              <p className="text-xs text-gray-400">Consistency</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{profile.stats.daysStreak} days</p>
              <p className="text-xs text-gray-400">Streak</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 