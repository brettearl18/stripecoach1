import { useState } from 'react';
import Image from 'next/image';
import {
  UserCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

// Mock data for the mockup
const mockClient = {
  name: 'John Smith',
  avatar: null,
  startDate: '2024-01-15',
  status: 'active',
  metrics: {
    streak: 4,
    completionRate: 85,
    lastCheckIn: '2024-03-20',
    progress: 75,
  },
  programHistory: [
    {
      id: '1',
      name: 'Weight Loss Program',
      status: 'active',
      startDate: '2024-01-15',
      endDate: null,
      progress: 75,
      milestones: [
        { date: '2024-02-01', title: 'Initial Assessment Complete' },
        { date: '2024-02-15', title: 'First Progress Review' },
        { date: '2024-03-01', title: 'Mid-Program Evaluation' },
      ],
    },
    {
      id: '2',
      name: 'Fitness Fundamentals',
      status: 'completed',
      startDate: '2023-10-01',
      endDate: '2023-12-31',
      progress: 100,
      achievements: ['Completed all workouts', 'Improved form', 'Hit strength goals'],
    },
    {
      id: '3',
      name: 'Nutrition Basics',
      status: 'archived',
      startDate: '2023-07-01',
      endDate: '2023-09-30',
      progress: 90,
      notes: 'Client switched to Weight Loss Program',
    },
  ],
};

export default function ClientProfileMockup() {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between">
            {/* Client Info */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                  {mockClient.avatar ? (
                    <Image
                      src={mockClient.avatar}
                      alt={mockClient.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black bg-opacity-50 rounded-full p-2">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                  {mockClient.name}
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Member since {new Date(mockClient.startDate).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Message
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                Quick Check-in
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {/* Check-in Streak */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium opacity-80">Check-in Streak</div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">{mockClient.metrics.streak}</div>
                    <div className="ml-2 text-sm opacity-80">weeks</div>
                  </div>
                </div>
                <FireIcon className="h-8 w-8 opacity-80" />
              </div>
              <div className="mt-2 text-xs opacity-80">Longest streak: 6 weeks</div>
            </div>

            {/* Completion Rate */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium opacity-80">Completion Rate</div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">{mockClient.metrics.completionRate}%</div>
                  </div>
                </div>
                <CheckCircleIcon className="h-8 w-8 opacity-80" />
              </div>
              <div className="mt-2 text-xs opacity-80">Last 30 days</div>
            </div>

            {/* Last Check-in */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium opacity-80">Last Check-in</div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">
                      {new Date(mockClient.metrics.lastCheckIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                <CalendarIcon className="h-8 w-8 opacity-80" />
              </div>
              <div className="mt-2 text-xs opacity-80">2 days ago</div>
            </div>

            {/* Overall Progress */}
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium opacity-80">Overall Progress</div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">{mockClient.metrics.progress}%</div>
                  </div>
                </div>
                <ChartBarIcon className="h-8 w-8 opacity-80" />
              </div>
              <div className="mt-2 text-xs opacity-80">+5% this week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Program History Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Program History</h2>
          
          <div className="space-y-6">
            {mockClient.programHistory.map((program) => (
              <div key={program.id} className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                
                {/* Program Card */}
                <div className="relative pl-12">
                  {/* Status Dot */}
                  <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center ${
                    program.status === 'active' ? 'bg-green-500' :
                    program.status === 'completed' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`}>
                    {program.status === 'active' ? <BoltIcon className="h-4 w-4 text-white" /> :
                     program.status === 'completed' ? <CheckCircleIcon className="h-4 w-4 text-white" /> :
                     <ClockIcon className="h-4 w-4 text-white" />}
                  </div>

                  {/* Program Content */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{program.name}</h3>
                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(program.startDate).toLocaleDateString()} - {program.endDate ? new Date(program.endDate).toLocaleDateString() : 'Present'}
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedProgram(expandedProgram === program.id ? null : program.id)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        {expandedProgram === program.id ? (
                          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{program.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            program.status === 'active' ? 'bg-green-500' :
                            program.status === 'completed' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${program.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedProgram === program.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        {program.milestones && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Milestones</h4>
                            {program.milestones.map((milestone, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <TrophyIcon className="h-5 w-5 text-yellow-500" />
                                <div>
                                  <div className="text-sm text-gray-900 dark:text-white">{milestone.title}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(milestone.date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {program.achievements && (
                          <div className="mt-4 space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Achievements</h4>
                            {program.achievements.map((achievement, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <SparklesIcon className="h-5 w-5 text-blue-500" />
                                <span className="text-sm text-gray-900 dark:text-white">{achievement}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {program.notes && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</h4>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{program.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 