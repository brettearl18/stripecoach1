'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ClipboardIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { defaultCheckInTemplate } from '@/lib/data/form-templates';
import { format, subDays } from 'date-fns';

// Test submission history
const testHistory = [
  {
    id: '1',
    date: '2024-03-16',
    overallScore: 4.2,
    metrics: {
      nutrition: 4.0,
      training: 4.5,
      mindset: 4.1,
      recovery: 4.0
    }
  },
  {
    id: '2',
    date: '2024-03-09',
    overallScore: 3.8,
    metrics: {
      nutrition: 3.5,
      training: 4.0,
      mindset: 3.9,
      recovery: 3.8
    }
  },
  {
    id: '3',
    date: '2024-03-02',
    overallScore: 3.5,
    metrics: {
      nutrition: 3.2,
      training: 3.8,
      mindset: 3.5,
      recovery: 3.5
    }
  }
];

// Sample data for history and analytics
const sampleHistory = [
  {
    id: 1,
    date: format(subDays(new Date(), 21), 'MMM dd, yyyy'),
    mealPrepRating: 4,
    mealsOut: 3,
    workoutsCompleted: 5,
    nutritionImprovements: ['Meal Planning', 'Water Intake']
  },
  {
    id: 2,
    date: format(subDays(new Date(), 14), 'MMM dd, yyyy'),
    mealPrepRating: 3,
    mealsOut: 5,
    workoutsCompleted: 4,
    nutritionImprovements: ['Protein Intake', 'Portion Control']
  },
  {
    id: 3,
    date: format(subDays(new Date(), 7), 'MMM dd, yyyy'),
    mealPrepRating: 5,
    mealsOut: 2,
    workoutsCompleted: 6,
    nutritionImprovements: ['Snacking Habits']
  }
];

const analyticsData = [
  {
    week: 'Week 1',
    mealPrep: 4,
    workouts: 5,
    mealsOut: 3
  },
  {
    week: 'Week 2',
    mealPrep: 3,
    workouts: 4,
    mealsOut: 5
  },
  {
    week: 'Week 3',
    mealPrep: 5,
    workouts: 6,
    mealsOut: 2
  }
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function CheckInPage() {
  const router = useRouter();
  const [template, setTemplate] = useState<FormTemplate>(defaultCheckInTemplate);
  const [lastSubmission, setLastSubmission] = useState<FormSubmission | null>(null);
  const [history, setHistory] = useState(testHistory);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (answers: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new submission
      const newSubmission = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        overallScore: 4.0, // This would be calculated based on answers
        metrics: {
          nutrition: 4.0,
          training: 4.0,
          mindset: 4.0,
          recovery: 4.0
        }
      };

      // Update history
      setHistory(prev => [newSubmission, ...prev]);
      setLastSubmission({
        id: newSubmission.id,
        clientId: 'test-client-id',
        coachId: 'test-coach-id',
        type: 'check-in',
        data: answers,
        submittedAt: new Date(),
        status: 'pending'
      });

      // Store last check-in time in localStorage
      localStorage.setItem('lastCheckIn', new Date().toISOString());
      
      // Reset coach review status for the new check-in
      localStorage.setItem('coachReviewStatus', JSON.stringify({
        checkInId: newSubmission.id,
        allSuggestionsAccepted: false,
        hasNewReview: false
      }));

      toast.success('Check-in submitted successfully!');
      
      // Wait for toast to be visible before redirecting
      setTimeout(() => {
        router.push('/client/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting check-in:', error);
      toast.error('Failed to submit check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    {
      name: 'Current Check-in',
      icon: ClipboardIcon,
      content: (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{template.name}</h2>
          <p className="text-gray-600 mb-6">{template.description}</p>
          <DynamicForm
            questions={template.questions}
            onSubmit={handleSubmit}
            initialValues={lastSubmission?.data}
            isSubmitting={isSubmitting}
          />
        </div>
      ),
    },
    {
      name: 'History',
      icon: ClockIcon,
      content: (
        <div className="space-y-6">
          {history.map((submission) => (
            <div key={submission.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Check-in: {submission.date}
                </h3>
                <span className="text-2xl font-bold text-indigo-600">
                  {submission.overallScore.toFixed(1)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(submission.metrics).map(([category, score]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{category}</span>
                      <span className="font-medium">{score.toFixed(1)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: 'Analytics',
      icon: ChartBarIcon,
      content: (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Over Time</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="overallScore" stroke="#4F46E5" />
                {Object.keys(history[0].metrics).map((metric, index) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={`metrics.${metric}`}
                    stroke={`hsl(${index * 90}, 70%, 50%)`}
                    name={metric.charAt(0).toUpperCase() + metric.slice(1)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#111827] text-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Tab.Group>
            <Tab.List className="flex space-x-4 rounded-xl bg-[#1F2937] p-1 mb-8">
              <Tab className={({ selected }) =>
                `w-full py-3 px-4 text-sm font-medium leading-5 rounded-lg flex items-center justify-center space-x-2
                ${selected 
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:bg-[#374151] hover:text-gray-200'}`
              }>
                <ClipboardIcon className="h-5 w-5" />
                <span>Current Check-in</span>
              </Tab>
              <Tab className={({ selected }) =>
                `w-full py-3 px-4 text-sm font-medium leading-5 rounded-lg flex items-center justify-center space-x-2
                ${selected
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:bg-[#374151] hover:text-gray-200'}`
              }>
                <ClockIcon className="h-5 w-5" />
                <span>History</span>
              </Tab>
              <Tab className={({ selected }) =>
                `w-full py-3 px-4 text-sm font-medium leading-5 rounded-lg flex items-center justify-center space-x-2
                ${selected
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:bg-[#374151] hover:text-gray-200'}`
              }>
                <ChartBarIcon className="h-5 w-5" />
                <span>Analytics</span>
              </Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>
                <div className="bg-[#1F2937] rounded-xl p-6 shadow-lg">
                  <h1 className="text-2xl font-bold text-white mb-2">Weekly Check-in</h1>
                  <p className="text-gray-400 mb-6">Track your progress across different areas of your fitness journey</p>
                  <DynamicForm
                    questions={template.questions}
                    onSubmit={handleSubmit}
                    initialValues={lastSubmission?.data}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="bg-[#1F2937] rounded-xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-4">Check-in History</h2>
                  <div className="space-y-4">
                    {sampleHistory.map((entry) => (
                      <div key={entry.id} className="bg-[#374151] rounded-lg p-4 hover:bg-[#4B5563] transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-indigo-400 font-medium">{entry.date}</span>
                          <div className="flex space-x-2">
                            <span className="px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded text-sm">
                              {entry.workoutsCompleted} workouts
                            </span>
                            <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm">
                              {entry.mealPrepRating}/5 prep
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-300">
                          <p>Meals eaten out: {entry.mealsOut}</p>
                          <p className="mt-1">Areas for improvement:</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {entry.nutritionImprovements.map((item) => (
                              <span key={item} className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="bg-[#1F2937] rounded-xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-4">Progress Analytics</h2>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-gray-200 mb-4">Weekly Progress Overview</h3>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analyticsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="week" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#374151',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#F3F4F6'
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="mealPrep"
                              name="Meal Prep Rating"
                              stroke="#818CF8"
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="workouts"
                              name="Workouts Completed"
                              stroke="#34D399"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-200 mb-4">Meals Out Comparison</h3>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="week" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#374151',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#F3F4F6'
                              }}
                            />
                            <Legend />
                            <Bar
                              dataKey="mealsOut"
                              name="Meals Eaten Out"
                              fill="#F87171"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </ErrorBoundary>
  );
} 