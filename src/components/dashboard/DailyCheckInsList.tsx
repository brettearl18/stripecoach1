import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { CheckInForm } from '@/types/checkIn';

interface DailyCheckInsListProps {
  checkIns: CheckInForm[];
}

export function DailyCheckInsList({ checkIns }: DailyCheckInsListProps) {
  const [todaysCheckIns, setTodaysCheckIns] = useState<CheckInForm[]>([]);

  useEffect(() => {
    // Filter check-ins for today
    const today = new Date().toISOString().split('T')[0];
    const filtered = checkIns.filter(checkIn => {
      const checkInDate = new Date(checkIn.dueDate).toISOString().split('T')[0];
      return checkInDate === today && checkIn.status !== 'completed';
    });
    setTodaysCheckIns(filtered);
  }, [checkIns]);

  if (todaysCheckIns.length === 0) {
    return (
      <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-2">Today's Check-ins</h2>
        <p className="text-gray-400">No check-ins scheduled for today! 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
      <h2 className="text-lg font-semibold text-white mb-4">Today's Check-ins</h2>
      <div className="space-y-3">
        {todaysCheckIns.map((checkIn) => (
          <Link
            key={checkIn.id}
            href={`/client/check-ins/${checkIn.id}`}
            className="block group"
          >
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 border border-gray-600/50 hover:border-blue-500/50 transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-white group-hover:text-blue-400 transition-colors">
                  {checkIn.title}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-400 mr-2">Due Today</span>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 