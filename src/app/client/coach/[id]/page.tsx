'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { getCoach } from '@/lib/services/firebaseService';
import { Coach } from '@/lib/services/firebaseService';

interface Props {
  params: {
    id: string;
  };
}

export default function CoachProfilePage({ params }: Props) {
  const [loading, setLoading] = useState(true);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoachData() {
      try {
        const coachData = await getCoach(params.id);
        if (coachData) {
          setCoach(coachData);
        } else {
          setError('Coach not found');
        }
      } catch (err) {
        setError('Failed to load coach data');
        console.error('Error loading coach:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCoachData();
  }, [params.id]);

  const handleScheduleCall = () => {
    // TODO: Implement calendar integration
    window.location.href = `/client/schedule/${params.id}`;
  };

  const handleSendMessage = () => {
    // TODO: Implement messaging
    window.location.href = `/client/messages?coach=${params.id}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-400">{error || 'Coach not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8 border border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-white">{coach.name.charAt(0)}</span>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{coach.name}</h1>
                <p className="text-gray-400 text-base sm:text-lg mb-4">{coach.title || 'Transformation Coach'}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <UserGroupIcon className="h-5 w-5 text-blue-400" />
                    {coach.clientCount || '50+'} active clients
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    {coach.rating || '4.9'} rating
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-0">
              <button 
                onClick={handleScheduleCall}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-white font-medium"
              >
                <CalendarIcon className="h-5 w-5" />
                <span>Schedule Call</span>
              </button>
              <button 
                onClick={handleSendMessage}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white font-medium"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Success Rate</h3>
                <p className="text-sm text-gray-400">Client transformations</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{coach.successRate || '94%'}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Experience</h3>
                <p className="text-sm text-gray-400">Years coaching</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{coach.yearsExperience || '8+'}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <ClockIcon className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Response Time</h3>
                <p className="text-sm text-gray-400">Average</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{coach.responseTime || '< 2h'}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <TrophyIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Achievements</h3>
                <p className="text-sm text-gray-400">Client milestones</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{coach.achievements || '500+'}</p>
          </div>
        </div>

        {/* Coaching Approach */}
        <div className="bg-gray-800/50 rounded-xl p-4 sm:p-8 mb-6 sm:mb-8 border border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Coaching Approach</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            {coach.approach || "I believe in sustainable transformation through personalized coaching. My approach combines evidence-based nutrition, strategic training, and behavioral psychology to help you achieve lasting results. I'll be your guide, accountability partner, and biggest supporter throughout your journey."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {(coach.specialties || ['Nutrition Planning', 'Strength Training', 'Habit Formation']).map((specialty, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4 flex items-center gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-200">{specialty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-gray-800/50 rounded-xl p-4 sm:p-8 border border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Recent Achievements</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {(coach.recentAchievements || [
              {
                title: "Client Weight Loss Milestone",
                description: "Helped 5 clients achieve their target weight this month"
              },
              {
                title: "Program Completion Rate",
                description: "Maintained a 95% program completion rate this quarter"
              }
            ]).map((achievement, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{achievement.title}</h3>
                <p className="text-gray-400">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 