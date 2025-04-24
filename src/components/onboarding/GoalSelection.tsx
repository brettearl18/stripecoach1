import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BoltIcon,
  FireIcon,
  MoonIcon,
  HeartIcon,
  SparklesIcon,
  ScaleIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

interface Goal {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  timeCommitment: string;
  exampleActivities: string[];
  complementaryGoals: string[];
}

const goals: Goal[] = [
  {
    id: 'nutrition',
    title: 'Nutrition',
    category: 'Lifestyle',
    description: 'Improve your eating habits and nutritional intake',
    icon: <ScaleIcon className="w-6 h-6" />,
    timeCommitment: 'Daily',
    exampleActivities: ['Meal planning', 'Nutrition tracking', 'Healthy cooking'],
    complementaryGoals: ['weight', 'energy', 'recovery']
  },
  {
    id: 'training',
    title: 'Training',
    category: 'Physical',
    description: 'Enhance your physical fitness and strength',
    icon: <FireIcon className="w-6 h-6" />,
    timeCommitment: '3-5 times/week',
    exampleActivities: ['Strength training', 'Cardio workouts', 'Flexibility exercises'],
    complementaryGoals: ['recovery', 'energy', 'sleep']
  },
  {
    id: 'sleep',
    title: 'Sleep',
    category: 'Recovery',
    description: 'Improve sleep quality and duration',
    icon: <MoonIcon className="w-6 h-6" />,
    timeCommitment: 'Daily',
    exampleActivities: ['Sleep tracking', 'Bedtime routine', 'Sleep environment optimization'],
    complementaryGoals: ['energy', 'recovery', 'stress']
  },
  {
    id: 'stress',
    title: 'Stress Management',
    category: 'Mental',
    description: 'Develop effective stress management techniques',
    icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
    timeCommitment: 'Daily',
    exampleActivities: ['Meditation', 'Breathing exercises', 'Journaling'],
    complementaryGoals: ['sleep', 'energy', 'mindset']
  },
  {
    id: 'habits',
    title: 'Daily Habits',
    category: 'Behavior',
    description: 'Build positive daily routines and habits',
    icon: <ClockIcon className="w-6 h-6" />,
    timeCommitment: 'Daily',
    exampleActivities: ['Morning routine', 'Evening routine', 'Habit tracking'],
    complementaryGoals: ['mindset', 'energy', 'stress']
  },
  {
    id: 'mindset',
    title: 'Mindset',
    category: 'Mental',
    description: 'Cultivate a positive and growth-oriented mindset',
    icon: <LightBulbIcon className="w-6 h-6" />,
    timeCommitment: 'Daily',
    exampleActivities: ['Gratitude practice', 'Affirmations', 'Visualization'],
    complementaryGoals: ['motivation', 'stress', 'habits']
  },
  {
    id: 'energy',
    title: 'Energy Levels',
    category: 'Wellness',
    description: 'Optimize your daily energy and vitality',
    icon: <BoltIcon className="w-6 h-6" />,
    timeCommitment: 'Daily',
    exampleActivities: ['Energy tracking', 'Activity scheduling', 'Rest periods'],
    complementaryGoals: ['sleep', 'nutrition', 'recovery']
  },
  {
    id: 'recovery',
    title: 'Recovery',
    category: 'Physical',
    description: 'Enhance your body\'s recovery processes',
    icon: <ArrowPathIcon className="w-6 h-6" />,
    timeCommitment: 'Daily',
    exampleActivities: ['Active recovery', 'Mobility work', 'Recovery tracking'],
    complementaryGoals: ['sleep', 'energy', 'training']
  },
  {
    id: 'motivation',
    title: 'Motivation',
    category: 'Mental',
    description: 'Build and maintain motivation for your goals',
    icon: <SparklesIcon className="w-6 h-6" />,
    timeCommitment: 'Daily',
    exampleActivities: ['Goal setting', 'Progress tracking', 'Reward system'],
    complementaryGoals: ['mindset', 'habits', 'training']
  }
];

interface GoalSelectionProps {
  onGoalsSelected: (goals: string[]) => void;
  initialSelectedGoals?: string[];
}

export default function GoalSelection({ onGoalsSelected, initialSelectedGoals = [] }: GoalSelectionProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(initialSelectedGoals);
  const [hoveredGoal, setHoveredGoal] = useState<string | null>(null);

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
  };

  const handleSubmit = () => {
    onGoalsSelected(selectedGoals);
  };

  const getSelectedGoalDetails = () => {
    return selectedGoals.map(id => goals.find(goal => goal.id === id)).filter(Boolean) as Goal[];
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Select Your Focus Areas</h2>
        <p className="text-gray-400">
          Choose the areas you want to focus on. You can select multiple goals that align with your priorities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {goals.map((goal) => (
          <motion.button
            key={goal.id}
            onClick={() => handleGoalSelect(goal.id)}
            onMouseEnter={() => setHoveredGoal(goal.id)}
            onMouseLeave={() => setHoveredGoal(null)}
            className={`
              relative p-4 rounded-lg text-left transition-all duration-200
              ${selectedGoals.includes(goal.id)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-4">
              <div className={`
                p-2 rounded-lg
                ${selectedGoals.includes(goal.id)
                  ? 'bg-blue-600'
                  : 'bg-gray-700'
                }
              `}>
                {goal.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{goal.title}</h3>
                <p className="text-sm opacity-80">{goal.category}</p>
              </div>
            </div>

            {(hoveredGoal === goal.id || selectedGoals.includes(goal.id)) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm"
              >
                <p className="mb-2">{goal.description}</p>
                <div className="flex items-center text-xs mb-2">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {goal.timeCommitment}
                </div>
                <div className="text-xs">
                  <span className="font-medium">Example activities:</span>
                  <ul className="list-disc list-inside">
                    {goal.exampleActivities.map(activity => (
                      <li key={activity}>{activity}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {selectedGoals.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-white mb-4">Selected Goals Preview</h3>
          <div className="space-y-4">
            {getSelectedGoalDetails().map(goal => (
              <div key={goal.id} className="flex items-center space-x-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  {goal.icon}
                </div>
                <div>
                  <h4 className="font-medium">{goal.title}</h4>
                  <p className="text-sm text-gray-400">{goal.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={selectedGoals.length === 0}
          className={`
            px-6 py-2 rounded-lg font-medium
            ${selectedGoals.length > 0
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Continue
        </button>
      </div>
    </div>
  );
} 