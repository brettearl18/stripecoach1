'use client';

import { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface WeekData {
  week: number;
  compliance: 'high' | 'medium' | 'low';
  checkIns: number;
  totalCheckIns: number;
  notes?: string;
}

export function ProgramTimeline() {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  
  // This would come from your backend in production
  const programData = {
    name: "Weight Loss & Strength - Phase 2",
    currentWeek: 6,
    totalWeeks: 12,
    checkInDays: ["Monday", "Thursday"],
    weeklyData: Array.from({ length: 12 }, (_, i) => ({
      week: i + 1,
      compliance: i < 6 
        ? (Math.random() > 0.5 ? 'high' : 'medium')
        : 'pending',
      checkIns: i < 6 ? Math.floor(Math.random() * 3) : 0,
      totalCheckIns: 2,
      notes: i === 5 ? "Great progress on strength goals" : undefined
    }))
  };

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case 'high':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-red-500';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">{programData.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-400">
              Week {programData.currentWeek} of {programData.totalWeeks}
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <InformationCircleIcon className="w-4 h-4" />
              <span>Check-ins: {programData.checkInDays.join(', ')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-400">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-400">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-400">Low</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex gap-1">
          {programData.weeklyData.map((week, index) => (
            <div
              key={week.week}
              className="flex-1 relative"
              onMouseEnter={() => setHoveredWeek(week.week)}
              onMouseLeave={() => setHoveredWeek(null)}
            >
              <div
                className={`
                  h-2 rounded-full transition-all duration-200
                  ${getComplianceColor(week.compliance)}
                  ${hoveredWeek === week.week ? 'h-3 -mt-0.5' : ''}
                `}
              />
              {week.week === programData.currentWeek && (
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-3 bg-blue-500" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 -mt-1" />
                </div>
              )}
              
              {/* Tooltip */}
              {hoveredWeek === week.week && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-48 bg-gray-900 rounded-lg p-3 text-sm shadow-xl z-10">
                  <div className="text-white font-medium mb-1">Week {week.week}</div>
                  <div className="text-gray-400">
                    Check-ins: {week.checkIns}/{week.totalCheckIns}
                  </div>
                  {week.notes && (
                    <div className="text-gray-400 mt-1 text-xs">{week.notes}</div>
                  )}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Week numbers */}
        <div className="flex justify-between mt-6 px-1">
          <span className="text-xs text-gray-500">Week 1</span>
          <span className="text-xs text-gray-500">Week {programData.totalWeeks}</span>
        </div>
      </div>
    </div>
  );
} 