'use client';

import { useEffect, useState } from 'react';
import { testClients } from '@/lib/test-data';
import { 
  TrophyIcon, 
  ChartBarIcon, 
  HeartIcon, 
  ArrowTrendingUpIcon,
  SparklesIcon,
  ArrowLeftIcon,
  CameraIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import PlaceholderImage from '@/components/PlaceholderImage';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

function generatePlaceholderImage(text: string, bgColor: string = '#f3f4f6'): string {
  // This would be replaced with actual image generation in production
  return `/placeholder-${text.toLowerCase().replace(' ', '-')}.jpg`;
}

export default function ClientReport({ params }: { params: { id: string } }) {
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const client = testClients.find(c => c.id === params.id) || testClients[0];
    
    setClientData({
      ...client,
      weightData: [165, 163, 161, 158, 156, 155],
      measurements: [
        {
          date: '2024-01-15',
          chest: 42,
          waist: 36,
          hips: 44,
          thighs: 24,
          arms: 15
        },
        {
          date: '2024-03-15',
          chest: 40,
          waist: 32,
          hips: 42,
          thighs: 22,
          arms: 14
        }
      ],
      progressPhotos: {
        before: {
          front: generatePlaceholderImage('Before Front'),
          side: generatePlaceholderImage('Before Side'),
          back: generatePlaceholderImage('Before Back')
        },
        after: {
          front: generatePlaceholderImage('After Front'),
          side: generatePlaceholderImage('After Side'),
          back: generatePlaceholderImage('After Back')
        }
      },
      wins: [
        "Consistently hit daily protein goals",
        "Completed all scheduled workouts",
        "Improved sleep quality by 35%",
        "Reduced stress levels significantly"
      ],
      keyMetrics: {
        weightLoss: 10,
        inchesLost: 11,
        workoutsCompleted: 24,
        daysTracked: 42
      },
      nextSteps: [
        "Increase workout intensity gradually",
        "Add one more strength training session",
        "Focus on stress management techniques",
        "Maintain current nutrition plan"
      ],
      badges: [
        "Consistency Champion",
        "Workout Warrior",
        "Nutrition Master",
        "Sleep Optimizer"
      ]
    });
    setLoading(false);
  }, [params.id]);

  if (loading || !clientData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          <span className="text-slate-600">Loading report...</span>
        </div>
      </div>
    );
  }

  // Weight progress chart data
  const weightChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Weight (lbs)',
        data: clientData.weightData,
        fill: true,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const weightChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgb(255, 255, 255)',
        titleColor: 'rgb(17, 24, 39)',
        bodyColor: 'rgb(75, 85, 99)',
        borderColor: 'rgb(229, 231, 235)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: () => 'Weight',
          label: (context: any) => `${context.parsed.y} lbs`,
        },
      },
    },
    scales: {
      y: {
        min: 150,
        max: 170,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Measurements radar chart data
  const measurementsChartData = {
    labels: ['Chest', 'Waist', 'Hips', 'Thighs', 'Arms'],
    datasets: [
      {
        label: 'Before',
        data: [
          clientData.measurements[0].chest,
          clientData.measurements[0].waist,
          clientData.measurements[0].hips,
          clientData.measurements[0].thighs,
          clientData.measurements[0].arms,
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgb(99, 102, 241)',
        pointBackgroundColor: 'rgb(99, 102, 241)',
      },
      {
        label: 'Current',
        data: [
          clientData.measurements[1].chest,
          clientData.measurements[1].waist,
          clientData.measurements[1].hips,
          clientData.measurements[1].thighs,
          clientData.measurements[1].arms,
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgb(16, 185, 129)',
        pointBackgroundColor: 'rgb(16, 185, 129)',
      }
    ]
  };

  const measurementsChartOptions = {
    responsive: true,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        suggestedMin: 0,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={`/admin/clients/${params.id}`}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to Profile</span>
              </Link>
              <h1 className="text-2xl font-bold text-slate-900">
                Progress Report
              </h1>
            </div>
            <div className="text-sm text-slate-500">
              Generated {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Client Overview Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white/20">
                <Image
                  src={clientData.profileImage || '/default-avatar.png'}
                  alt={clientData.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{clientData.name}</h2>
                <p className="text-indigo-100">Journey started {new Date(clientData.startDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Progress Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Progress Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Weight Progress</h3>
              <div className="h-[300px]">
                <Line data={weightChartData} options={weightChartOptions} />
              </div>
            </div>

            {/* Measurements Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Body Measurements</h3>
              <div className="h-[300px]">
                <Radar data={measurementsChartData} options={measurementsChartOptions} />
              </div>
            </div>
          </div>

          {/* Progress Photos */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Progress Photos</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Before: {clientData.measurements[0].date}</span>
                <span>•</span>
                <span>After: {clientData.measurements[1].date}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['front', 'side', 'back'].map((view) => (
                <div key={view} className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-900 capitalize">{view} View</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Before Photo */}
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-slate-100">
                      <PlaceholderImage 
                        text={`Before\n${view} View`}
                        width={300}
                        height={300}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2">
                        Before
                      </div>
                    </div>
                    {/* After Photo */}
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-slate-100">
                      <PlaceholderImage 
                        text={`After\n${view} View`}
                        width={300}
                        height={300}
                        bgColor="#f0fdf4"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2">
                        After
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: <TrophyIcon className="h-6 w-6 text-amber-500" />,
                label: "Weight Loss",
                value: `${clientData.keyMetrics.weightLoss} lbs`,
                bg: "bg-amber-50"
              },
              {
                icon: <ChartBarIcon className="h-6 w-6 text-emerald-500" />,
                label: "Inches Lost",
                value: `${clientData.keyMetrics.inchesLost}"`,
                bg: "bg-emerald-50"
              },
              {
                icon: <HeartIcon className="h-6 w-6 text-rose-500" />,
                label: "Workouts",
                value: clientData.keyMetrics.workoutsCompleted,
                bg: "bg-rose-50"
              },
              {
                icon: <ArrowTrendingUpIcon className="h-6 w-6 text-blue-500" />,
                label: "Days Tracked",
                value: clientData.keyMetrics.daysTracked,
                bg: "bg-blue-50"
              }
            ].map((metric, i) => (
              <div key={i} className={`${metric.bg} rounded-xl p-4`}>
                <div className="flex items-center gap-3 mb-2">
                  {metric.icon}
                  <span className="text-slate-600 font-medium">{metric.label}</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
              </div>
            ))}
          </div>

          {/* Recent Wins & Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wins */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Wins</h3>
              <div className="space-y-3">
                {clientData.wins.map((win, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1">
                      <SparklesIcon className="h-5 w-5 text-amber-400" />
                    </div>
                    <p className="text-slate-700">{win}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Earned Badges</h3>
              <div className="grid grid-cols-2 gap-4">
                {clientData.badges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <TrophyIcon className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recommended Next Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientData.nextSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-slate-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 