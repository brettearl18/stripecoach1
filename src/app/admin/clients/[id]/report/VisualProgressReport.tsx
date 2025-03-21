'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  CameraIcon,
  ScaleIcon,
  ChartBarIcon,
  SparklesIcon,
  StarIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

interface ProgressPhotoSet {
  date: string;
  front: string;
  side: string;
  back: string;
}

interface Measurement {
  date: string;
  chest: number;
  waist: number;
  hips: number;
  thighs: number;
  arms: number;
}

interface VisualProgressReportProps {
  clientName: string;
  startDate: string;
  currentDate: string;
  weightData: number[];
  progressPhotos: ProgressPhotoSet[];
  measurements: Measurement[];
  client: any;
}

export default function VisualProgressReport({
  clientName,
  startDate,
  currentDate,
  weightData,
  progressPhotos,
  measurements,
  client,
}: VisualProgressReportProps) {
  // Weight progress chart data
  const weightChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Weight (lbs)',
        data: weightData,
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
      title: {
        display: true,
        text: 'Weight Progress Journey',
        color: '#1F2937',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        min: Math.min(...weightData) - 5,
        max: Math.max(...weightData) + 5,
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
  const latestMeasurements = measurements[measurements.length - 1];
  const firstMeasurements = measurements[0];

  const measurementsChartData = {
    labels: ['Chest', 'Waist', 'Hips', 'Thighs', 'Arms'],
    datasets: [
      {
        label: 'Starting Measurements',
        data: [
          firstMeasurements.chest,
          firstMeasurements.waist,
          firstMeasurements.hips,
          firstMeasurements.thighs,
          firstMeasurements.arms,
        ],
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 2,
      },
      {
        label: 'Current Measurements',
        data: [
          latestMeasurements.chest,
          latestMeasurements.waist,
          latestMeasurements.hips,
          latestMeasurements.thighs,
          latestMeasurements.arms,
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
      },
    ],
  };

  const measurementsChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Body Measurements Comparison',
        color: '#1F2937',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0
      }
    }
  };

  // Calculate total inches lost
  const totalInchesLost = (
    (firstMeasurements.chest - latestMeasurements.chest) +
    (firstMeasurements.waist - latestMeasurements.waist) +
    (firstMeasurements.hips - latestMeasurements.hips) +
    (firstMeasurements.thighs - latestMeasurements.thighs) +
    (firstMeasurements.arms - latestMeasurements.arms)
  ).toFixed(1);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{clientName}'s Transformation Journey</h2>
        <p className="text-slate-500">
          {startDate} - {currentDate}
        </p>
      </div>

      {/* Weight Progress */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weight Chart - Takes up 2 columns */}
          <div className="md:col-span-2">
            <div className="h-[300px]">
              <Line data={weightChartData} options={weightChartOptions} />
            </div>
          </div>

          {/* Client Profile Summary - Takes up 1 column */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100 space-y-4">
            {/* Profile Photo */}
            <div className="flex justify-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100">
                <Image
                  src={client.profileImage || '/default-avatar.png'}
                  alt={client.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Client Name */}
            <div className="text-center">
              <h3 className="font-semibold text-slate-900">{client.name}</h3>
              <p className="text-sm text-slate-500">Started {new Date(client.startDate).toLocaleDateString()}</p>
            </div>

            {/* Journey Stats */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Time with us</span>
                <span className="font-medium text-slate-900">
                  {Math.ceil((new Date().getTime() - new Date(client.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Check-ins completed</span>
                <span className="font-medium text-slate-900">{client.checkIns?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Current streak</span>
                <span className="font-medium text-green-600">{client.currentStreak || 0} days</span>
              </div>
            </div>

            {/* Key Milestones */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-2">Recent Milestones</h4>
              <div className="space-y-2">
                {client.milestones?.slice(0, 2).map((milestone, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="mt-1">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                    </div>
                    <p className="text-xs text-slate-600">{milestone}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-2">Earned Badges</h4>
              <div className="flex flex-wrap gap-2">
                {client.badges?.slice(0, 3).map((badge, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-full"
                  >
                    <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center">
                      <ShieldCheckIcon className="h-3 w-3 text-indigo-600" />
                    </div>
                    <span className="text-xs text-indigo-700">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Weight Stats Grid - Below the chart */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weight Stats */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-indigo-100 rounded-full p-2">
                <ScaleIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <h4 className="font-medium text-slate-900">Weight Progress</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Starting Weight</span>
                <span className="font-medium text-slate-900">{weightData[0]} lbs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Current Weight</span>
                <span className="font-medium text-slate-900">{weightData[weightData.length - 1]} lbs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Loss</span>
                <span className="font-medium text-green-600">-{weightData[0] - weightData[weightData.length - 1]} lbs</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${((weightData[0] - weightData[weightData.length - 1]) / weightData[0] * 100).toFixed(1)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Rate of Loss */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 rounded-full p-2">
                <ChartBarIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-slate-900">Rate of Progress</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Weekly Average</span>
                <span className="font-medium text-slate-900">
                  {((weightData[0] - weightData[weightData.length - 1]) / (weightData.length - 1)).toFixed(1)} lbs/week
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Best Week</span>
                <span className="font-medium text-green-600">
                  {Math.max(...weightData.slice(0, -1).map((w, i) => weightData[i] - weightData[i + 1])).toFixed(1)} lbs
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Consistency</span>
                <span className="font-medium text-slate-900">
                  {(weightData.slice(0, -1).filter((w, i) => weightData[i] > weightData[i + 1]).length / (weightData.length - 1) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Maintaining healthy rate of 1-2 lbs per week
              </div>
            </div>
          </div>

          {/* Projections */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-rose-100 rounded-full p-2">
                <SparklesIcon className="h-5 w-5 text-rose-600" />
              </div>
              <h4 className="font-medium text-slate-900">Goal Projections</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Target Weight</span>
                <span className="font-medium text-slate-900">{(weightData[weightData.length - 1] - 10).toFixed(1)} lbs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Estimated Time</span>
                <span className="font-medium text-slate-900">
                  {Math.ceil(10 / ((weightData[0] - weightData[weightData.length - 1]) / (weightData.length - 1)))} weeks
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Projected Date</span>
                <span className="font-medium text-indigo-600">
                  {new Date(new Date().setDate(new Date().getDate() + (Math.ceil(10 / ((weightData[0] - weightData[weightData.length - 1]) / (weightData.length - 1))) * 7))).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Based on current progress rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wins & Milestones */}
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <ChartBarIcon className="h-5 w-5 text-indigo-600" />
          Key Wins & Milestones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Highlights */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-indigo-100 rounded-full p-2">
                  <ChartBarIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <h4 className="font-medium text-slate-900">Weekly Highlights</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="bg-green-100 rounded-full p-1 mt-0.5">
                    <ArrowDownIcon className="h-3 w-3 text-green-600" />
                  </div>
                  <p className="text-sm text-slate-600">Consistently hit daily step goal of 10,000 steps</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-green-100 rounded-full p-1 mt-0.5">
                    <ArrowDownIcon className="h-3 w-3 text-green-600" />
                  </div>
                  <p className="text-sm text-slate-600">Completed all planned workouts (3x strength, 2x cardio)</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-green-100 rounded-full p-1 mt-0.5">
                    <ArrowDownIcon className="h-3 w-3 text-green-600" />
                  </div>
                  <p className="text-sm text-slate-600">Maintained calorie deficit while hitting protein goals</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <SparklesIcon className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="font-medium text-slate-900">Non-Scale Victories</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                    <StarIcon className="h-3 w-3 text-purple-600" />
                  </div>
                  <p className="text-sm text-slate-600">Clothes fitting better - down one dress size!</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                    <StarIcon className="h-3 w-3 text-purple-600" />
                  </div>
                  <p className="text-sm text-slate-600">Increased energy levels throughout the day</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                    <StarIcon className="h-3 w-3 text-purple-600" />
                  </div>
                  <p className="text-sm text-slate-600">Better sleep quality and morning routine</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-rose-100 rounded-full p-2">
                <ClockIcon className="h-5 w-5 text-rose-600" />
              </div>
              <h4 className="font-medium text-slate-900">Key Milestones</h4>
            </div>
            <div className="space-y-6">
              <div className="relative pl-6 pb-6 border-l-2 border-indigo-200">
                <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-indigo-600"></div>
                <p className="text-xs text-indigo-600 font-medium mb-1">Week 1</p>
                <p className="text-sm text-slate-600">Initial weigh-in: {weightData[0]} lbs</p>
              </div>
              <div className="relative pl-6 pb-6 border-l-2 border-indigo-200">
                <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-indigo-600"></div>
                <p className="text-xs text-indigo-600 font-medium mb-1">Week 3</p>
                <p className="text-sm text-slate-600">First 5 lbs lost! Celebrated with a new workout outfit</p>
              </div>
              <div className="relative pl-6 pb-6 border-l-2 border-indigo-200">
                <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-indigo-600"></div>
                <p className="text-xs text-indigo-600 font-medium mb-1">Week 5</p>
                <p className="text-sm text-slate-600">Hit strength training PR - squatted body weight!</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-green-600"></div>
                <p className="text-xs text-green-600 font-medium mb-1">Current</p>
                <p className="text-sm text-slate-600">Total loss: {weightData[0] - weightData[weightData.length - 1]} lbs and {totalInchesLost}" inches!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Photos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <CameraIcon className="h-5 w-5 text-indigo-600" />
          Progress Photo Comparison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {progressPhotos.length >= 2 && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900 text-center">Front View Progress</p>
                <div className="relative rounded-xl overflow-hidden bg-slate-100">
                  <div className="absolute inset-0 grid grid-cols-2">
                    <div className="relative">
                      <img 
                        src={progressPhotos[0].front} 
                        alt="Before front"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                        Before
                      </div>
                    </div>
                    <div className="relative">
                      <img 
                        src={progressPhotos[progressPhotos.length - 1].front}
                        alt="After front"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded">
                        After
                      </div>
                    </div>
                  </div>
                  <div className="pt-[100%]"></div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900 text-center">Side View Progress</p>
                <div className="relative rounded-xl overflow-hidden bg-slate-100">
                  <div className="absolute inset-0 grid grid-cols-2">
                    <div className="relative">
                      <img 
                        src={progressPhotos[0].side} 
                        alt="Before side"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                        Before
                      </div>
                    </div>
                    <div className="relative">
                      <img 
                        src={progressPhotos[progressPhotos.length - 1].side}
                        alt="After side"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded">
                        After
                      </div>
                    </div>
                  </div>
                  <div className="pt-[100%]"></div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900 text-center">Back View Progress</p>
                <div className="relative rounded-xl overflow-hidden bg-slate-100">
                  <div className="absolute inset-0 grid grid-cols-2">
                    <div className="relative">
                      <img 
                        src={progressPhotos[0].back} 
                        alt="Before back"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                        Before
                      </div>
                    </div>
                    <div className="relative">
                      <img 
                        src={progressPhotos[progressPhotos.length - 1].back}
                        alt="After back"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded">
                        After
                      </div>
                    </div>
                  </div>
                  <div className="pt-[100%]"></div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="text-sm text-slate-500 text-center mt-4">
          {Math.abs(weightData[0] - weightData[weightData.length - 1])} lbs lost in {progressPhotos.length - 1} months
        </div>
      </div>

      {/* Measurements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <ScaleIcon className="h-5 w-5 text-indigo-600" />
          Body Measurements Progress
        </h3>
        <div className="bg-slate-50 rounded-xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Measurements Chart */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="h-[400px]">
                <Radar data={measurementsChartData} options={{
                  ...measurementsChartOptions,
                  plugins: {
                    ...measurementsChartOptions.plugins,
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                        font: {
                          size: 12
                        }
                      }
                    }
                  },
                  scales: {
                    r: {
                      angleLines: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                      },
                      pointLabels: {
                        font: {
                          size: 12,
                          weight: '600'
                        }
                      },
                      suggestedMin: 0,
                      ticks: {
                        stepSize: 10,
                        font: {
                          size: 10
                        }
                      }
                    }
                  }
                }} />
              </div>
            </div>

            {/* Measurements Details */}
            <div className="space-y-4">
              {Object.entries(latestMeasurements).map(([key, value]) => {
                if (key === 'date') return null;
                const difference = firstMeasurements[key] - value;
                const percentChange = ((difference / firstMeasurements[key]) * 100).toFixed(1);
                return (
                  <div key={key} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 capitalize">{key}</h4>
                        <p className="text-xs text-slate-500">Target: {(value - 1).toFixed(1)}"</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{value}"</p>
                        <p className={`text-sm ${difference > 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                          {difference > 0 ? (
                            <>
                              <ArrowDownIcon className="w-4 h-4" />
                              -{Math.abs(difference)}"
                            </>
                          ) : (
                            <>
                              <ArrowUpIcon className="w-4 h-4" />
                              +{Math.abs(difference)}"
                            </>
                          )}
                          <span className="text-xs text-slate-500">({Math.abs(percentChange)}%)</span>
                        </p>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`absolute left-0 top-0 h-full rounded-full ${
                          difference > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min(Math.abs(percentChange), 100)}%`,
                          transition: 'width 1s ease-in-out'
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Total Progress Summary */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Total Progress</h4>
                  <p className="text-lg font-bold">{totalInchesLost}" Lost</p>
                </div>
                <p className="text-sm opacity-90">
                  {totalInchesLost > 0 
                    ? `Great progress! You've lost ${totalInchesLost} inches overall.`
                    : 'Keep going! Every small change counts.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Ready Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white text-center">
        <h3 className="text-xl font-bold mb-2">Amazing Transformation!</h3>
        <p className="text-lg">
          {weightData[0] - weightData[weightData.length - 1]} lbs & {totalInchesLost}" Lost in {progressPhotos.length} Weeks!
        </p>
        <p className="text-sm mt-2 opacity-80">
          Want to start your transformation journey? Contact us today!
        </p>
      </div>
    </div>
  );
} 