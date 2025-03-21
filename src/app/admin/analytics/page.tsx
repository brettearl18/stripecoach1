'use client';

import { useState, useEffect } from 'react';
import { getCoaches, getClientsByCoach, getFormSubmissions, getCheckInForms, type Coach, type Client, type FormSubmission, type CheckInForm } from '@/lib/services/firebaseService';
import { ChartBarIcon, UserGroupIcon, CheckCircleIcon, ClockIcon, ArrowRightIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface CoachStats {
  coach: Coach;
  totalClients: number;
  activeClients: number;
  completionRate: number;
  averageResponseTime: string;
  clientProgress: {
    improving: number;
    steady: number;
    declining: number;
  };
}

interface CategorySummary {
  name: string;
  totalResponses: number;
  averageScore: number;
  trend: 'up' | 'down' | 'stable';
  improvement: number;
  topIssues: string[];
  successAreas: string[];
}

export default function AdminAnalytics() {
  const [coachStats, setCoachStats] = useState<CoachStats[]>([]);
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all([
        loadCoachStats(),
        loadCategorySummaries()
      ]);
    } catch (err) {
      setError('Failed to load analytics data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategorySummaries = async () => {
    try {
      // Get all form submissions and forms
      const submissions = await getFormSubmissions();
      const forms = await getCheckInForms();

      if (!submissions.length) {
        // If no submissions, return mock data
        return setCategorySummaries([
          {
            name: 'Nutrition',
            totalResponses: 0,
            averageScore: 0,
            trend: 'stable',
            improvement: 0,
            topIssues: ['No data available'],
            successAreas: ['No data available']
          },
          {
            name: 'Exercise',
            totalResponses: 0,
            averageScore: 0,
            trend: 'stable',
            improvement: 0,
            topIssues: ['No data available'],
            successAreas: ['No data available']
          },
          {
            name: 'Sleep',
            totalResponses: 0,
            averageScore: 0,
            trend: 'stable',
            improvement: 0,
            topIssues: ['No data available'],
            successAreas: ['No data available']
          },
          {
            name: 'Stress Management',
            totalResponses: 0,
            averageScore: 0,
            trend: 'stable',
            improvement: 0,
            topIssues: ['No data available'],
            successAreas: ['No data available']
          }
        ]);
      }

      // Define categories based on your check-in form questions
      const categories = {
        'Nutrition': {
          keywords: ['meal', 'diet', 'food', 'eating', 'nutrition', 'protein', 'calories'],
          responses: 0,
          scores: [] as number[],
          issues: new Map<string, number>(),
          successes: new Map<string, number>()
        },
        'Exercise': {
          keywords: ['workout', 'exercise', 'training', 'cardio', 'strength', 'fitness'],
          responses: 0,
          scores: [] as number[],
          issues: new Map<string, number>(),
          successes: new Map<string, number>()
        },
        'Sleep': {
          keywords: ['sleep', 'rest', 'recovery', 'nap', 'bedtime'],
          responses: 0,
          scores: [] as number[],
          issues: new Map<string, number>(),
          successes: new Map<string, number>()
        },
        'Stress Management': {
          keywords: ['stress', 'anxiety', 'meditation', 'mindfulness', 'mental'],
          responses: 0,
          scores: [] as number[],
          issues: new Map<string, number>(),
          successes: new Map<string, number>()
        }
      };

      // Process submissions
      submissions.forEach(submission => {
        const form = forms.find(f => f.id === submission.formId);
        if (!form) return;

        // Process each answer
        Object.entries(submission.answers).forEach(([questionId, answer]) => {
          const question = form.questions.find(q => q.id === parseInt(questionId));
          if (!question) return;

          // Determine which category this question belongs to
          for (const [category, data] of Object.entries(categories)) {
            const isRelevant = data.keywords.some(keyword => 
              question.text.toLowerCase().includes(keyword)
            );

            if (isRelevant) {
              data.responses++;
              
              // Handle different question types
              if (question.type === 'scale') {
                data.scores.push(Number(answer));
              } else if (question.type === 'text') {
                // Analyze text responses for sentiment
                const response = String(answer).toLowerCase();
                const isPositive = response.includes('good') || response.includes('great') || response.includes('better');
                const isNegative = response.includes('bad') || response.includes('struggle') || response.includes('difficult');

                if (isNegative) {
                  const issue = response.split(' ').slice(0, 3).join(' ');
                  data.issues.set(issue, (data.issues.get(issue) || 0) + 1);
                }
                if (isPositive) {
                  const success = response.split(' ').slice(0, 3).join(' ');
                  data.successes.set(success, (data.successes.get(success) || 0) + 1);
                }
              }
            }
          }
        });
      });

      // Convert the processed data into CategorySummary objects
      const summaries: CategorySummary[] = Object.entries(categories).map(([name, data]) => {
        const averageScore = data.scores.length > 0
          ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
          : 7.5; // Default score if no scale questions

        // Get top 3 issues and successes
        const topIssues = Array.from(data.issues.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([issue]) => issue);

        const topSuccesses = Array.from(data.successes.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([success]) => success);

        // Calculate trend based on recent scores
        const recentScores = data.scores.slice(-5);
        const trend = recentScores.length >= 2
          ? recentScores[recentScores.length - 1] > recentScores[0] ? 'up' : 'down'
          : 'stable';

        // Calculate improvement percentage
        const improvement = recentScores.length >= 2
          ? ((recentScores[recentScores.length - 1] - recentScores[0]) / recentScores[0]) * 100
          : 0;

        return {
          name,
          totalResponses: data.responses,
          averageScore: averageScore,
          trend,
          improvement: Math.round(improvement),
          topIssues: topIssues.length > 0 ? topIssues : ['No major issues reported'],
          successAreas: topSuccesses.length > 0 ? topSuccesses : ['Data collection in progress']
        };
      });

      setCategorySummaries(summaries);
    } catch (error) {
      console.error('Error loading category summaries:', error);
      // Fall back to empty data state
      setCategorySummaries([
        {
          name: 'Nutrition',
          totalResponses: 0,
          averageScore: 0,
          trend: 'stable',
          improvement: 0,
          topIssues: ['Error loading data'],
          successAreas: ['Error loading data']
        },
        {
          name: 'Exercise',
          totalResponses: 0,
          averageScore: 0,
          trend: 'stable',
          improvement: 0,
          topIssues: ['Error loading data'],
          successAreas: ['Error loading data']
        },
        {
          name: 'Sleep',
          totalResponses: 0,
          averageScore: 0,
          trend: 'stable',
          improvement: 0,
          topIssues: ['Error loading data'],
          successAreas: ['Error loading data']
        },
        {
          name: 'Stress Management',
          totalResponses: 0,
          averageScore: 0,
          trend: 'stable',
          improvement: 0,
          topIssues: ['Error loading data'],
          successAreas: ['Error loading data']
        }
      ]);
    }
  };

  const loadCoachStats = async () => {
    try {
      setIsLoading(true);
      const coaches = await getCoaches();
      
      const stats = await Promise.all(
        coaches.map(async (coach) => {
          const clients = await getClientsByCoach(coach.id!);
          
          // Calculate statistics
          const totalClients = clients.length;
          // Consider a client active if they have no status field or if their status is 'active'
          const activeClients = clients.filter(client => !client.status || client.status === 'active').length;
          
          // Mock data for demonstration
          const completionRate = Math.random() * 30 + 70; // 70-100%
          const averageResponseTime = `${Math.floor(Math.random() * 24)}h`;
          
          const clientProgress = {
            improving: Math.floor(Math.random() * 5),
            steady: Math.floor(Math.random() * 3),
            declining: Math.floor(Math.random() * 2)
          };

          return {
            coach,
            totalClients,
            activeClients,
            completionRate,
            averageResponseTime,
            clientProgress
          };
        })
      );

      // Sort by completion rate
      stats.sort((a, b) => b.completionRate - a.completionRate);
      setCoachStats(stats);
    } catch (error) {
      console.error('Error loading coach stats:', error);
    }
  };

  const handleViewDashboard = (coachId: string) => {
    router.push(`/coach/dashboard?id=${coachId}`);
  };

  if (isLoading) {
  return (
      <div className="min-h-screen bg-[#0B0F15] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
              </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F15] to-[#1A1F2B] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Coach Leaderboard</h1>
            <p className="text-gray-400 text-lg">Performance metrics and client compliance across all coaches</p>
        </div>

          <div className="bg-[#1A1F2B]/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/50 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#2A303C]/50">
                    <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">Rank</th>
                    <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">Coach</th>
                    <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">Clients</th>
                    <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">Completion Rate</th>
                    <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">Response Time</th>
                    <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">Client Progress</th>
                    <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {coachStats.map((stat, index) => (
                    <tr key={stat.coach.id} className="hover:bg-[#2A303C]/30 transition-colors duration-200">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <span className={`text-lg font-bold ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-gray-300' :
                            index === 2 ? 'text-amber-700' :
                            'text-gray-500'
                          }`}>
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                            <UserGroupIcon className="h-6 w-6 text-blue-400" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-100">{stat.coach.name}</div>
                            <div className="text-sm text-gray-400">{stat.coach.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm">
                          <span className="text-green-400 font-medium">{stat.activeClients}</span>
                          <span className="text-gray-500"> / </span>
                          <span className="text-gray-300">{stat.totalClients}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-700/50 rounded-full h-2.5 mr-3">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-400 h-2.5 rounded-full"
                              style={{ width: `${stat.completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{Math.round(stat.completionRate)}%</span>
                            </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center text-sm">
                          <ClockIcon className="h-4 w-4 text-blue-400 mr-2" />
                          <span className="font-medium">{stat.averageResponseTime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mr-2" />
                            <span className="text-sm font-medium text-green-400">{stat.clientProgress.improving}</span>
                            </div>
                          <div className="flex items-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 mr-2" />
                            <span className="text-sm font-medium text-yellow-400">{stat.clientProgress.steady}</span>
                            </div>
                          <div className="flex items-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-red-400 to-rose-500 mr-2" />
                            <span className="text-sm font-medium text-red-400">{stat.clientProgress.declining}</span>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => handleViewDashboard(stat.coach.id!)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg transition-all duration-200 text-sm font-medium shadow-lg shadow-blue-500/20"
                        >
                          View Dashboard
                          <ArrowRightIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Check-in Categories Overview</h2>
            <p className="text-gray-400 text-lg">Aggregated insights from client check-ins across all categories</p>
                    </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categorySummaries.map((category) => (
              <div key={category.name} className="bg-[#1A1F2B]/80 backdrop-blur-sm rounded-xl p-8 border border-gray-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-100 mb-1">{category.name}</h3>
                    <p className="text-gray-400 text-sm">{category.totalResponses} responses</p>
                  </div>
                  <div className="flex items-center gap-2 bg-[#2A303C]/50 px-3 py-1.5 rounded-full">
                    <div className={`text-sm font-medium ${
                      category.trend === 'up' ? 'text-green-400' :
                      category.trend === 'down' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {category.improvement > 0 ? '+' : ''}{category.improvement}%
                    </div>
                    {category.trend === 'up' ? (
                      <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
                    ) : category.trend === 'down' ? (
                      <ArrowTrendingDownIcon className="h-5 w-5 text-red-400" />
                    ) : (
                      <div className="h-5 w-5 flex items-center">
                        <div className="h-0.5 w-4 bg-yellow-400 rounded-full"></div>
                    </div>
                    )}
          </div>
        </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-400">Average Score</span>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                      {category.averageScore.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-700/30 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                      style={{ width: `${(category.averageScore / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
                      Top Issues
                    </h4>
                    <ul className="space-y-2">
                      {category.topIssues.map((issue, index) => (
                        <li key={index} className="text-sm text-gray-300 bg-[#2A303C]/30 px-4 py-2 rounded-lg">
                          {issue}
                        </li>
                      ))}
                    </ul>
          </div>

                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                      Success Areas
                    </h4>
                    <ul className="space-y-2">
                      {category.successAreas.map((area, index) => (
                        <li key={index} className="text-sm text-gray-300 bg-[#2A303C]/30 px-4 py-2 rounded-lg">
                          {area}
                        </li>
                      ))}
                    </ul>
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