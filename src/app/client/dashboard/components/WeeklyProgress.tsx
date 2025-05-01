'use client';

import { useEffect, useState } from 'react';

interface ProgressRingProps {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  animate?: boolean;
}

function ProgressRing({
  value,
  maxValue,
  size = 120,
  strokeWidth = 8,
  color,
  label,
  animate = true
}: ProgressRingProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressPercent = (currentValue / maxValue) * 100;
  const offset = circumference - (progressPercent / 100) * circumference;

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setCurrentValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setCurrentValue(value);
    }
  }, [value, animate]);

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-gray-700 fill-none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={`fill-none ${color} transition-all duration-1000 ease-out`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(progressPercent)}%</span>
        <span className="text-sm text-gray-400 mt-1">{label}</span>
      </div>
    </div>
  );
}

export function WeeklyProgress() {
  const progress = {
    checkIns: {
      value: 5,
      maxValue: 7,
      color: 'stroke-blue-500',
      label: 'Check-ins'
    },
    compliance: {
      value: 92,
      maxValue: 100,
      color: 'stroke-green-500',
      label: 'Compliance'
    },
    nutrition: {
      value: 85,
      maxValue: 100,
      color: 'stroke-orange-500',
      label: 'Nutrition'
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6">Weekly Progress</h2>
      <div className="flex items-center justify-between">
        <ProgressRing {...progress.checkIns} />
        <ProgressRing {...progress.compliance} />
        <ProgressRing {...progress.nutrition} />
      </div>
    </div>
  );
} 