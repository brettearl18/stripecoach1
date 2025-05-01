'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Habit {
  id: string;
  name: string;
  days: boolean[];
  createdAt: string;
  type: 'system' | 'custom';
}

const defaultHabits: Habit[] = [
  {
    id: 'morning-workout',
    name: 'Morning Workout',
    days: [false, false, false, false, false, false, false],
    createdAt: new Date().toISOString(),
    type: 'system'
  },
  {
    id: 'protein-goal',
    name: 'Hit Protein Goal',
    days: [false, false, false, false, false, false, false],
    createdAt: new Date().toISOString(),
    type: 'system'
  },
  {
    id: 'sleep',
    name: '8hrs Sleep',
    days: [false, false, false, false, false, false, false],
    createdAt: new Date().toISOString(),
    type: 'system'
  },
  {
    id: 'water',
    name: 'Water 3L',
    days: [false, false, false, false, false, false, false],
    createdAt: new Date().toISOString(),
    type: 'system'
  }
];

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch habits from backend
    // This would replace the defaultHabits with actual user data
  }, []);

  const handleAddHabit = () => {
    if (!newHabitName.trim()) {
      toast.error('Please enter a habit name');
      return;
    }

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      days: [false, false, false, false, false, false, false],
      createdAt: new Date().toISOString(),
      type: 'custom'
    };

    setHabits([...habits, newHabit]);
    setNewHabitName('');
    toast.success('Habit added successfully');
  };

  const handleDeleteHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit?.type === 'system') {
      toast.error('Cannot delete system habits');
      return;
    }

    setHabits(habits.filter(h => h.id !== habitId));
    toast.success('Habit deleted successfully');
  };

  const toggleDay = (habitId: string, dayIndex: number) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newDays = [...habit.days];
        newDays[dayIndex] = !newDays[dayIndex];
        return { ...habit, days: newDays };
      }
      return habit;
    }));

    // TODO: Sync with backend
    toast.success('Progress updated');
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Weekly Habits</h1>
          <p className="text-gray-400">Track your daily habits and build consistency</p>
        </div>

        {/* Add New Habit */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Enter new habit name..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddHabit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Habits Grid */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="grid grid-cols-[2fr_repeat(7,1fr)_auto] gap-4 mb-4">
            <div className="text-sm font-medium text-gray-400">Habit</div>
            {weekDays.map(day => (
              <div key={day} className="text-sm font-medium text-gray-400 text-center">
                {day}
              </div>
            ))}
            <div className="w-8"></div> {/* Space for delete button */}
          </div>

          <div className="space-y-4">
            {habits.map(habit => (
              <div key={habit.id} className="grid grid-cols-[2fr_repeat(7,1fr)_auto] gap-4 items-center">
                <div className="text-white font-medium">{habit.name}</div>
                {habit.days.map((completed, index) => (
                  <button
                    key={index}
                    onClick={() => toggleDay(habit.id, index)}
                    className={`h-10 rounded-lg flex items-center justify-center transition-colors ${
                      completed
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-gray-700 text-gray-500 hover:bg-gray-600'
                    }`}
                  >
                    {completed && <CheckIcon className="w-5 h-5" />}
                  </button>
                ))}
                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  disabled={habit.type === 'system'}
                  className={`p-2 rounded-lg ${
                    habit.type === 'system'
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-red-500 hover:bg-red-500/10'
                  }`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 