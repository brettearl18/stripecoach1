'use client';

import { useState, useEffect } from 'react';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface CheckInSchedule {
  days: number[];
  startHour: number;
}

interface Client {
  id: string;
  name: string;
  programType: string;
  checkInSchedule: CheckInSchedule;
}

interface CheckInButtonProps {
  client: Client;
}

export function CheckInButton({ client }: CheckInButtonProps) {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [nextCheckIn, setNextCheckIn] = useState('');

  useEffect(() => {
    const calculateCheckInWindow = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentHour = now.getHours();
      
      // Find the next check-in day
      const nextDay = client.checkInSchedule.days.find(day => 
        day > currentDay || (day === currentDay && currentHour < client.checkInSchedule.startHour)
      ) || client.checkInSchedule.days[0];

      // Calculate days until next check-in
      const daysUntilNext = nextDay > currentDay 
        ? nextDay - currentDay 
        : (7 - currentDay) + nextDay;

      // Set window open state
      setIsWindowOpen(
        client.checkInSchedule.days.includes(currentDay) && 
        currentHour >= client.checkInSchedule.startHour
      );

      // Format next check-in date
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + daysUntilNext);
      nextDate.setHours(client.checkInSchedule.startHour, 0, 0, 0);

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      setNextCheckIn(`${dayNames[nextDay]}, ${nextDate.toLocaleTimeString([], { 
        hour: 'numeric',
        minute: '2-digit'
      })}`);
    };

    calculateCheckInWindow();
    const interval = setInterval(calculateCheckInWindow, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [client.checkInSchedule]);

  return (
    <Link
      href={isWindowOpen ? '/client/check-in' : '#'}
      className={`
        relative block w-full group transition-all duration-200
        ${isWindowOpen 
          ? 'cursor-pointer' 
          : 'cursor-not-allowed'
        }
      `}
      onClick={(e) => !isWindowOpen && e.preventDefault()}
    >
      <div className={`
        relative overflow-hidden rounded-lg border transition-all duration-200
        ${isWindowOpen
          ? 'bg-gradient-to-r from-blue-500/20 to-blue-500/10 border-blue-500/20 hover:border-blue-500/40'
          : 'bg-gray-800/50 border-gray-700'
        }
      `}>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-lg
              ${isWindowOpen 
                ? 'bg-blue-500/20' 
                : 'bg-gray-700'
              }
            `}>
              <ClipboardDocumentCheckIcon className={`
                w-5 h-5
                ${isWindowOpen 
                  ? 'text-blue-400' 
                  : 'text-gray-400'
                }
              `} />
            </div>
            <div>
              <h3 className={`
                font-medium transition-colors
                ${isWindowOpen 
                  ? 'text-blue-400' 
                  : 'text-gray-400'
                }
              `}>
                {isWindowOpen ? 'Check-in Available' : 'Next Check-in'}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {isWindowOpen ? 'Click to start your check-in' : nextCheckIn}
              </p>
            </div>
          </div>
        </div>

        {/* Animated border gradient */}
        {isWindowOpen && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity" />
        )}

        {/* Pulsing dot when check-in is available */}
        {isWindowOpen && (
          <div className="absolute top-4 right-4">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
            </span>
          </div>
        )}
      </div>
    </Link>
  );
} 