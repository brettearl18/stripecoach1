'use client';

import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

interface Habit {
  id: string;
  name: string;
  days: boolean[];
  target: number;
  current: number;
}

export function HabitsCell() {
  // This would come from your backend in a real implementation
  const [habits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Morning Workout',
      days: [true, true, false, true, false, false, false],
      target: 5,
      current: 4
    },
    {
      id: '2',
      name: 'Hit Protein Goal',
      days: [true, true, true, false, false, false, false],
      target: 7,
      current: 3
    },
    {
      id: '3',
      name: '8hrs Sleep',
      days: [true, false, true, true, false, false, false],
      target: 6,
      current: 3
    }
  ]);

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Weekly Habits</h2>
        <div className="text-sm text-gray-400">
          Week Progress: {Math.round((habits.reduce((acc, habit) => acc + habit.current, 0) / 
            habits.reduce((acc, habit) => acc + habit.target, 0)) * 100)}%
        </div>
      </div>

      <div className="space-y-6">
        {habits.map((habit) => (
          <div key={habit.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">{habit.name}</span>
              <span className="text-sm text-gray-400">
                {habit.current}/{habit.target} days
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {habit.days.map((completed, index) => (
                <div
                  key={index}
                  className={`
                    h-8 rounded-md flex items-center justify-center text-xs
                    ${completed 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-gray-700/50 text-gray-500'
                    }
                  `}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400">{weekDays[index]}</span>
                    {completed && <CheckIcon className="w-3 h-3" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 