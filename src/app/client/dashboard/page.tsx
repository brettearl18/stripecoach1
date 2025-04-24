'use client';

import { useState } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ScaleIcon,
  ChartBarIcon,
  HeartIcon,
  FireIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  BoltIcon,
  UserGroupIcon,
  TrophyIcon,
  StarIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
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
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Mock data for the past 30 days
const generateMockData = () => {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // Generate weight data starting at 185 with small variations
  const weights = Array.from({ length: 30 }, (_, i) => {
    const baseWeight = 185;
    const progress = i * 0.2; // Lose about 0.2 lbs per day
    const variation = Math.random() * 0.4 - 0.2; // Add some natural variation
    return (baseWeight - progress + variation).toFixed(1);
  });

  // Generate body fat percentage data starting at 22% with small variations
  const bodyFat = Array.from({ length: 30 }, (_, i) => {
    const baseBodyFat = 22;
    const progress = i * 0.1; // Lose about 0.1% per day
    const variation = Math.random() * 0.2 - 0.1;
    return (baseBodyFat - progress + variation).toFixed(1);
  });

  return { dates, weights, bodyFat };
};

const mockData = generateMockData();

// Mock workout schedule data
const workoutSchedule = [
  { day: 'Mon', workout: 'Upper Body', time: '7:00 AM', completed: true },
  { day: 'Tue', workout: 'Lower Body', time: '7:00 AM', completed: true },
  { day: 'Wed', workout: 'Rest Day', time: null, completed: true },
  { day: 'Thu', workout: 'Full Body', time: '7:00 AM', completed: false },
  { day: 'Fri', workout: 'HIIT', time: '7:00 AM', completed: false },
  { day: 'Sat', workout: 'Cardio', time: '8:00 AM', completed: false },
  { day: 'Sun', workout: 'Rest Day', time: null, completed: false },
];

// Mock activity feed
const activityFeed = [
  {
    type: 'workout',
    title: 'Completed Upper Body Workout',
    time: '2 hours ago',
    details: '45 minutes • 350 calories',
    icon: BoltIcon,
    color: 'text-blue-500',
  },
  {
    type: 'nutrition',
    title: 'Logged Breakfast',
    time: '5 hours ago',
    details: '520 calories • 35g protein',
    icon: SparklesIcon,
    color: 'text-green-500',
  },
  {
    type: 'achievement',
    title: 'New Personal Best',
    time: '1 day ago',
    details: 'Bench Press: 185 lbs',
    icon: FireIcon,
    color: 'text-orange-500',
  },
];

// Mock nutrition data
const nutritionSummary = {
  calories: { consumed: 1850, goal: 2200 },
  protein: { consumed: 145, goal: 180 },
  carbs: { consumed: 190, goal: 250 },
  fats: { consumed: 55, goal: 70 },
};

// Mock habits data
const weeklyHabits = [
  { name: 'Morning Workout', days: [true, true, true, false, false, false, false] },
  { name: 'Hit Protein Goal', days: [true, true, false, true, false, false, false] },
  { name: '8hrs Sleep', days: [true, false, true, true, false, false, false] },
  { name: 'Water 3L', days: [true, true, true, true, false, false, false] },
];

// Add mock client data
const clientProfile = {
  name: "David Rodriguez",
  avatar: null, // URL for profile photo
  email: "david.r@example.com",
  joinedDate: "January 2024",
  programType: "Weight Loss & Strength",
  currentStreak: 14,
  totalCheckIns: 45,
  badges: [
    {
      id: 1,
      name: "90-Day Warrior",
      icon: TrophyIcon,
      color: "from-amber-500 to-orange-500",
      description: "Completed 90 days of consistent training",
      earnedDate: "2024-03-15"
    },
    {
      id: 2,
      name: "Protein Champion",
      icon: BoltIcon,
      color: "from-blue-500 to-indigo-500",
      description: "Hit protein goals for 30 consecutive days",
      earnedDate: "2024-03-10"
    },
    {
      id: 3,
      name: "Early Bird",
      icon: SparklesIcon,
      color: "from-purple-500 to-pink-500",
      description: "Completed 10 workouts before 7 AM",
      earnedDate: "2024-03-01"
    },
    {
      id: 4,
      name: "Progress Master",
      icon: ChartBarIcon,
      color: "from-green-500 to-emerald-500",
      description: "Logged measurements for 8 consecutive weeks",
      earnedDate: "2024-02-15"
    }
  ],
  stats: {
    completedWorkouts: 48,
    totalWeight: "15 lbs",
    avgCompliance: "92%"
  }
};

// Mock client data (in a real app, this would come from your auth/API)
const mockClientData = {
  id: "cl_david123",
  name: "David Rodriguez",
  programType: "Weight Loss & Strength",
  checkInSchedule: {
    days: [1, 4], // Monday and Thursday
    startHour: 6,
    endHour: 22
  }
};

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(75, 85, 99, 0.3)',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(156, 163, 175, 1)',
        font: {
          size: 10,
        },
        maxRotation: 0,
      },
    },
    y: {
      grid: {
        color: 'rgba(75, 85, 99, 0.1)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(156, 163, 175, 1)',
        font: {
          size: 10,
        },
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
};

// Progress ring component
const ProgressRing = ({ value, max, label, color }) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 38; // radius = 38
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="38"
            stroke="rgba(75, 85, 99, 0.2)"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="48"
            cy="48"
            r="38"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}</span>
        </div>
      </div>
      <span className="mt-2 text-sm text-gray-400">{label}</span>
    </div>
  );
};

// Helper function to determine if check-in window is open
const isCheckInWindowOpen = (schedule: { days: number[], startHour: number, endHour: number }) => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentHour = now.getHours();
  
  return schedule.days.includes(dayOfWeek) && 
         currentHour >= schedule.startHour && 
         currentHour < schedule.endHour;
};

// Get next check-in window text
const getNextCheckInWindow = (schedule: { days: number[], startHour: number }) => {
  const now = new Date();
  const currentDay = now.getDay();
  const nextDay = schedule.days.find(day => day > currentDay) || schedule.days[0];
  const daysUntilNext = nextDay > currentDay ? nextDay - currentDay : (7 - currentDay) + nextDay;
  
  const date = new Date();
  date.setDate(date.getDate() + daysUntilNext);
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `${dayNames[nextDay]} ${schedule.startHour}:00 AM`;
};

// Check-in Button Component
const CheckInButton = ({ clientData }: { clientData: typeof mockClientData }) => {
  const isWindowOpen = isCheckInWindowOpen(clientData.checkInSchedule);
  const nextWindow = getNextCheckInWindow(clientData.checkInSchedule);
  
  const buttonClasses = `
    flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
    ${isWindowOpen 
      ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer' 
      : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
  `;

  const handleClick = () => {
    if (isWindowOpen) {
      // Navigate to personalized check-in form
      window.location.href = `/client/check-ins/${clientData.id}/new`;
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={!isWindowOpen}
      className={buttonClasses}
    >
      {isWindowOpen ? (
        <>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Submit Check-in
        </>
      ) : (
        <>
          <span className="h-3 w-3 rounded-full bg-gray-500"></span>
          Next Check-in: {nextWindow}
        </>
      )}
    </button>
  );
};

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Calculate progress metrics
  const startWeight = parseFloat(mockData.weights[0]);
  const currentWeight = parseFloat(mockData.weights[mockData.weights.length - 1]);
  const weightLoss = (startWeight - currentWeight).toFixed(1);
  const weightLossPercentage = ((weightLoss / startWeight) * 100).toFixed(1);

  const startBodyFat = parseFloat(mockData.bodyFat[0]);
  const currentBodyFat = parseFloat(mockData.bodyFat[mockData.bodyFat.length - 1]);
  const bodyFatLoss = (startBodyFat - currentBodyFat).toFixed(1);

    return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-[1920px] mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Progress Dashboard</h1>
          <CheckInButton clientData={mockClientData} />
      </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Side Panel - make it narrower */}
          <div className="lg:w-72 space-y-4">
            {/* Profile Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  {clientProfile.avatar ? (
                    <img
                      src={clientProfile.avatar}
                      alt={clientProfile.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-700"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-medium text-white">
                      {clientProfile.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 right-0 bg-green-500 w-5 h-5 rounded-full border-4 border-gray-800" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-white">{clientProfile.name}</h2>
                <p className="text-gray-400">{clientProfile.programType}</p>
                <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{clientProfile.currentStreak}</p>
                    <p className="text-gray-400">Day Streak</p>
                  </div>
                  <div className="h-10 w-px bg-gray-700" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{clientProfile.totalCheckIns}</p>
                    <p className="text-gray-400">Check-ins</p>
            </div>
          </div>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white">{clientProfile.joinedDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Workouts</span>
                  <span className="text-white">{clientProfile.stats.completedWorkouts}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Weight Lost</span>
                  <span className="text-white">{clientProfile.stats.totalWeight}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Avg. Compliance</span>
                  <span className="text-white">{clientProfile.stats.avgCompliance}</span>
                </div>
              </div>
            </div>
            
            {/* Badges */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
              <h3 className="text-lg font-bold text-white mb-4">Achievements</h3>
              <div className="grid grid-cols-2 gap-4">
                {clientProfile.badges.map((badge) => (
                  <button
                    key={badge.id}
                    className={`relative group p-4 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors ${
                      selectedBadge?.id === badge.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedBadge(selectedBadge?.id === badge.id ? null : badge)}
                  >
                    <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${badge.color} p-3`}>
                      <badge.icon className="w-full h-full text-white" />
                    </div>
                    <p className="mt-2 text-sm text-white font-medium text-center">{badge.name}</p>
                    
                    {/* Badge Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <p className="text-sm text-white">{badge.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Earned {new Date(badge.earnedDate).toLocaleDateString()}</p>
              </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Program Progress */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
              <h3 className="text-lg font-bold text-white mb-4">Program Progress</h3>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-500 bg-blue-500/10">
                      Phase 2
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-white">
                      65%
                    </span>
                  </div>
                </div>
                <div className="flex h-2 mb-4 overflow-hidden rounded-full bg-gray-700">
                  <div
                    style={{ width: "65%" }}
                    className="flex flex-col justify-center overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500"
                  ></div>
                </div>
                <div className="text-xs text-gray-400">
                  Next milestone: Complete 4 more workouts
              </div>
              </div>
            </div>
          </div>
          
          {/* Main Content - adjust gap and padding */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Progress Dashboard</h1>
              <p className="mt-1 text-gray-400">Track your fitness journey</p>
            </div>

            {/* Progress Cards - adjust to 4 columns on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Current Weight</p>
                    <p className="mt-1 text-2xl font-bold text-white">{currentWeight} lbs</p>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <ScaleIcon className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowDownIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">{weightLoss} lbs</span>
                  <span className="text-gray-400 ml-2">from start</span>
        </div>
      </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Body Fat</p>
                    <p className="mt-1 text-2xl font-bold text-white">{currentBodyFat}%</p>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <ChartBarIcon className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowDownIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">{bodyFatLoss}%</span>
                  <span className="text-gray-400 ml-2">from start</span>
                </div>
            </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                    <p className="text-sm text-gray-400">Avg. Daily Steps</p>
                    <p className="mt-1 text-2xl font-bold text-white">8,742</p>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <FireIcon className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">12%</span>
                  <span className="text-gray-400 ml-2">vs last week</span>
                </div>
                    </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Resting Heart Rate</p>
                    <p className="mt-1 text-2xl font-bold text-white">68 bpm</p>
                      </div>
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <HeartIcon className="w-6 h-6 text-red-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowDownIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">3 bpm</span>
                  <span className="text-gray-400 ml-2">from last month</span>
                </div>
              </div>
            </div>

            {/* Progress Rings - adjust to 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col items-center">
                <ProgressRing
                  value={weightLossPercentage}
                  max={100}
                  label="Weight Loss Goal"
                  color="#3B82F6"
                />
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col items-center">
                <ProgressRing
                  value={85}
                  max={100}
                  label="Workout Completion"
                  color="#10B981"
                />
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col items-center">
                <ProgressRing
                  value={92}
                  max={100}
                  label="Nutrition Plan Adherence"
                  color="#8B5CF6"
                />
        </div>
            </div>

            {/* Main Content Grid - adjust column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              {/* Charts Column - span 3 columns */}
              <div className="lg:col-span-3 space-y-4">
                {/* Weight Chart */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-white">Weight Progress</h2>
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg text-sm px-3 py-1"
                    >
                      <option value="7d">7 Days</option>
                      <option value="30d">30 Days</option>
                      <option value="90d">90 Days</option>
                    </select>
                  </div>
                  <div className="h-80">
                    <Line
                      data={{
                        labels: mockData.dates,
                        datasets: [
                          {
                            label: 'Weight (lbs)',
                            data: mockData.weights,
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true,
                          },
                        ],
                      }}
                      options={chartOptions}
                    />
                  </div>
                </div>

                {/* Body Fat Chart */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-white">Body Fat %</h2>
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg text-sm px-3 py-1"
                    >
                      <option value="7d">7 Days</option>
                      <option value="30d">30 Days</option>
                      <option value="90d">90 Days</option>
                    </select>
                  </div>
                  <div className="h-80">
                    <Line
                      data={{
                        labels: mockData.dates,
                        datasets: [
                          {
                            label: 'Body Fat %',
                            data: mockData.bodyFat,
                            borderColor: '#8B5CF6',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            tension: 0.4,
                            fill: true,
                          },
                        ],
                      }}
                      options={chartOptions}
                    />
                  </div>
                </div>
              </div>

              {/* Workout Schedule - single column */}
              <div className="space-y-4">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
                  <h2 className="text-lg font-bold text-white mb-4">This Week's Schedule</h2>
                  <div className="space-y-3">
                    {workoutSchedule.map((day, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-400 w-8">{day.day}</span>
                          <div>
                            <p className="text-white font-medium">{day.workout}</p>
                            {day.time && (
                              <p className="text-sm text-gray-400">{day.time}</p>
                            )}
                          </div>
                        </div>
                        {day.completed ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : day.workout !== 'Rest Day' ? (
                          <ClockIcon className="w-5 h-5 text-gray-400" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
                    </div>

            {/* Lower Grid - adjust to 3 equal columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Activity Feed */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
                <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {activityFeed.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg bg-gray-700`}>
                        <activity.icon className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-400">{activity.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrition Summary */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
                <h2 className="text-lg font-bold text-white mb-4">Today's Nutrition</h2>
                <div className="space-y-4">
                  {Object.entries(nutritionSummary).map(([nutrient, data]) => (
                    <div key={nutrient} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 capitalize">{nutrient}</span>
                        <span className="text-white">
                          {data.consumed} / {data.goal}
                          {nutrient === 'calories' ? ' kcal' : 'g'}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            nutrient === 'calories'
                              ? 'bg-blue-500'
                              : nutrient === 'protein'
                              ? 'bg-red-500'
                              : nutrient === 'carbs'
                              ? 'bg-green-500'
                              : 'bg-yellow-500'
                          }`}
                        style={{
                            width: `${(data.consumed / data.goal) * 100}%`,
                        }}
                        />
                      </div>
                  </div>
                ))}
              </div>
            </div>

              {/* Weekly Habits */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
                <h2 className="text-lg font-bold text-white mb-4">Weekly Habits</h2>
                <div className="space-y-4">
                  {weeklyHabits.map((habit, habitIndex) => (
                    <div key={habitIndex} className="space-y-2">
                      <p className="text-sm text-gray-400">{habit.name}</p>
                      <div className="flex gap-2">
                        {habit.days.map((completed, dayIndex) => (
                          <div
                            key={dayIndex}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              completed
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-gray-700 text-gray-500'
                            }`}
                          >
                            {completed ? (
                              <CheckCircleIcon className="w-5 h-5" />
                            ) : (
                              <div className="w-5 h-5" />
          )}
        </div>
                        ))}
            </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}