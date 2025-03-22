'use client';

import { useState } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  VideoCameraIcon,
  ClipboardDocumentCheckIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events] = useState([
    {
      id: 1,
      title: 'Client Check-in: Sarah Johnson',
      type: 'Check-in',
      date: '2024-03-22',
      time: '10:00 AM',
      status: 'scheduled',
      coach: 'Michael Smith'
    },
    {
      id: 2,
      title: 'Progress Review: James Wilson',
      type: 'Review',
      date: '2024-03-22',
      time: '2:00 PM',
      status: 'completed',
      coach: 'Emma Davis'
    },
    {
      id: 3,
      title: 'Initial Consultation: Lisa Brown',
      type: 'Consultation',
      date: '2024-03-23',
      time: '11:30 AM',
      status: 'cancelled',
      coach: 'Michael Smith'
    }
  ]);

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'check-in':
        return <ClipboardDocumentCheckIcon className="h-4 w-4 text-blue-400" />;
      case 'review':
        return <VideoCameraIcon className="h-4 w-4 text-purple-400" />;
      case 'consultation':
        return <CameraIcon className="h-4 w-4 text-green-400" />;
      default:
        return null;
    }
  };

  const getEventStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'check-in':
        return 'bg-blue-500/10 text-blue-400 border-blue-400/20';
      case 'review':
        return 'bg-purple-500/10 text-purple-400 border-purple-400/20';
      case 'consultation':
        return 'bg-green-500/10 text-green-400 border-green-400/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-400/20';
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-[#1a1b1e] border border-gray-800" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const dayEvents = getEventsForDate(dateString);

      days.push(
        <div key={day} className="h-32 bg-[#1a1b1e] border border-gray-800 p-2">
          <div className="text-sm text-gray-400 mb-2">{day}</div>
          <div className="space-y-1">
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                className={`p-1 rounded text-xs border ${getEventStyle(event.type)} flex items-center`}
              >
                <span className="mr-1">{getEventIcon(event.type)}</span>
                <div>
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-xs opacity-75">{event.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-[#1a1b1e] rounded-lg border border-gray-800 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-white">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px">
        {/* Day Headers */}
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
            {day}
          </div>
        ))}
        {/* Calendar Days */}
        {renderCalendar()}
      </div>
    </div>
  );
} 