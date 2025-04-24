'use client';

import { useState, useEffect } from 'react';
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

// Mock coach data
const mockCoachData = {
  name: "Sarah Wilson",
  title: "Senior Fitness & Nutrition Coach",
  avatar: "/avatars/sarah.jpg",
  specialties: ["Weight Management", "Strength Training", "Nutrition Planning"],
  experience: "8+ years",
  certifications: [
    "Certified Strength & Conditioning Specialist (CSCS)",
    "Precision Nutrition Level 2",
    "CrossFit Level 2 Trainer"
  ],
  availability: {
    nextSession: "2024-04-23T15:00:00Z",
    timezone: "Pacific Time (PT)",
    typicalResponse: "Within 2 hours",
  },
  stats: {
    clientsTransformed: 500,
    avgWeightLoss: "15kg",
    successRate: "92%",
    avgClientTenure: "14 months"
  },
  recentAchievements: [
    {
      title: "Top Coach 2024",
      description: "Recognized for exceptional client results and satisfaction",
      date: "2024-03"
    },
    {
      title: "Advanced Sports Nutrition",
      description: "Completed advanced certification in sports nutrition",
      date: "2024-02"
    }
  ],
  approach: [
    {
      title: "Personalized Programming",
      description: "Custom workout and nutrition plans based on your specific goals and lifestyle"
    },
    {
      title: "Data-Driven Progress",
      description: "Regular assessments and adjustments based on your progress metrics"
    },
    {
      title: "Holistic Wellness",
      description: "Focus on sustainable lifestyle changes, not just quick fixes"
    }
  ]
};

export default function CoachProfilePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Coach Profile Header */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-medium text-white">
              {mockCoachData.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">{mockCoachData.name}</h1>
                  <p className="text-gray-400">{mockCoachData.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StarIcon className="w-5 h-5 text-yellow-500" />
                    <span className="text-yellow-500 font-medium">{mockCoachData.stats.successRate} Success Rate</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Schedule Call
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {mockCoachData.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <UserGroupIcon className="w-6 h-6 text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-white">{mockCoachData.stats.clientsTransformed}+</div>
                <div className="text-sm text-gray-400">Clients Transformed</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <TrophyIcon className="w-6 h-6 text-green-400 mb-2" />
                <div className="text-2xl font-bold text-white">{mockCoachData.stats.avgWeightLoss}</div>
                <div className="text-sm text-gray-400">Avg. Weight Loss</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <StarIcon className="w-6 h-6 text-yellow-400 mb-2" />
                <div className="text-2xl font-bold text-white">{mockCoachData.stats.successRate}</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <ClockIcon className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-white">{mockCoachData.stats.avgClientTenure}</div>
                <div className="text-sm text-gray-400">Avg. Client Tenure</div>
              </div>
            </div>

            {/* Coaching Approach */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Coaching Approach</h2>
              <div className="space-y-4">
                {mockCoachData.approach.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="p-2 bg-gray-700 rounded-lg h-fit">
                      <AcademicCapIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{item.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Recent Achievements</h2>
              <div className="space-y-4">
                {mockCoachData.recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="p-2 bg-gray-700 rounded-lg h-fit">
                      <TrophyIcon className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{achievement.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{achievement.description}</p>
                      <p className="text-gray-500 text-sm mt-1">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <CalendarIcon className="w-5 h-5" />
                  Schedule 1:1 Call
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Send Message
                </button>
              </div>
            </div>

            {/* Availability & Response Time */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Availability</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-gray-400 mb-1">Next Available Session</div>
                  <div className="text-white">
                    {new Date(mockCoachData.availability.nextSession).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Timezone</div>
                  <div className="text-white">{mockCoachData.availability.timezone}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Typical Response Time</div>
                  <div className="text-white">{mockCoachData.availability.typicalResponse}</div>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Certifications</h2>
              <div className="space-y-3">
                {mockCoachData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <AcademicCapIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                    <span className="text-gray-300">{cert}</span>
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