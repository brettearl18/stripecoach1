'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  TrophyIcon,
  FireIcon,
  StarIcon,
  HeartIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface Achievement {
  id: string;
  title: string;
  date: string;
  icon: 'trophy' | 'star' | 'fire' | 'heart' | 'chart' | 'sparkles';
}

export default function ProfileOverview() {
  // This would come from your user context/API in a real implementation
  const [profile] = useState({
    name: 'Alex Johnson',
    avatar: '/placeholder-avatar.jpg',
    joinedDate: '2024-01-15',
    programWeek: 8,
    totalWeeks: 12,
    goals: [
      'Lose 10kg by June',
      'Run 5km without stopping',
      'Improve overall strength'
    ],
    stats: {
      checkInStreak: 12,
      totalWorkouts: 45,
      avgCompliance: 92,
    },
    achievements: [
      {
        id: '1',
        title: '30 Day Streak',
        date: '2024-03-01',
        icon: 'fire'
      },
      {
        id: '2',
        title: 'First 5K',
        date: '2024-02-15',
        icon: 'trophy'
      },
      {
        id: '3',
        title: 'Perfect Week',
        date: '2024-03-10',
        icon: 'star'
      }
    ] as Achievement[]
  });

  const getAchievementIcon = (icon: Achievement['icon']) => {
    switch (icon) {
      case 'trophy':
        return <TrophyIcon className="w-4 h-4 text-yellow-500" />;
      case 'star':
        return <StarIcon className="w-4 h-4 text-purple-500" />;
      case 'fire':
        return <FireIcon className="w-4 h-4 text-orange-500" />;
      case 'heart':
        return <HeartIcon className="w-4 h-4 text-red-500" />;
      case 'chart':
        return <ChartBarIcon className="w-4 h-4 text-blue-500" />;
      case 'sparkles':
        return <SparklesIcon className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700">
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-gray-800" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-sm px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full">
              Week {profile.programWeek} of {profile.totalWeeks}
            </div>
            <div className="h-1 w-1 rounded-full bg-gray-600" />
            <span className="text-sm text-gray-400">
              Member since {new Date(profile.joinedDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-400">Streak</span>
          </div>
          <p className="text-xl font-semibold mt-1">{profile.stats.checkInStreak} days</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-400">Workouts</span>
          </div>
          <p className="text-xl font-semibold mt-1">{profile.stats.totalWorkouts}</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-400">Compliance</span>
          </div>
          <p className="text-xl font-semibold mt-1">{profile.stats.avgCompliance}%</p>
        </div>
      </div>

      {/* Goals Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Current Goals</h3>
        <div className="space-y-2">
          {profile.goals.map((goal, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-700/30 px-3 py-2 rounded-lg"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-300">{goal}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Achievements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {profile.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center gap-3 bg-gray-700/30 p-3 rounded-lg"
            >
              <div className="p-2 rounded-lg bg-gray-700">
                {getAchievementIcon(achievement.icon)}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{achievement.title}</p>
                <p className="text-xs text-gray-400">
                  {new Date(achievement.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 