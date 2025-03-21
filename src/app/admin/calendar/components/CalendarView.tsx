'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

// Sample data - would be fetched from API
const sampleEvents = [
  {
    id: 1,
    title: 'Weekly Check-in',
    clientName: 'John Smith',
    type: 'check-in',
    date: '2024-03-20',
    time: '09:00',
    recurring: true,
    frequency: 'weekly',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    id: 2,
    title: 'Body Measurements',
    clientName: 'Sarah Johnson',
    type: 'measurement',
    date: '2024-03-15',
    time: '14:00',
    recurring: true,
    frequency: 'monthly',
    color: 'bg-green-50 text-green-700 border-green-200'
  }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState(sampleEvents);

  // Get calendar days for current month
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startPadding = firstDay.getDay();
    
    // Add padding days from previous month
    for (let i = 0; i < startPadding; i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({
        date: prevDate,
        isCurrentMonth: false,
        events: []
      });
    }
    
    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = events.filter(event => event.date === dateStr);
      
      days.push({
        date,
        isCurrentMonth: true,
        events: dayEvents
      });
    }
    
    // Add padding days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        events: []
      });
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleModifyEvent = (event) => {
    // This would open a modal to modify the event
    setSelectedEvent(event);
  };

  const handleCancelEvent = async (event) => {
    if (event.recurring) {
      // Show confirmation dialog for recurring events
      const confirmCancel = window.confirm(
        'This is a recurring event. Do you want to cancel:\n' +
        '- Just this occurrence\n' +
        '- All future occurrences\n' +
        '- All occurrences'
      );
      
      if (!confirmCancel) return;
    }
    
    // This would call the API to cancel the event
    console.log('Cancelling event:', event);
    setEvents(prev => prev.filter(e => e.id !== event.id));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Calendar</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-medium text-gray-900">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
          
          {getDaysInMonth().map((day, idx) => (
            <div
              key={idx}
              className={classNames(
                'bg-white p-2 h-32 overflow-y-auto',
                !day.isCurrentMonth && 'bg-gray-50 text-gray-400'
              )}
            >
              <div className="font-medium text-sm mb-1">
                {day.date.getDate()}
              </div>
              
              {day.events.map((event) => (
                <div
                  key={event.id}
                  className={classNames(
                    'mb-1 p-1 rounded text-xs border',
                    event.color
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{event.time} - {event.title}</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleModifyEvent(event)}
                        className="p-1 hover:bg-white rounded"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleCancelEvent(event)}
                        className="p-1 hover:bg-white rounded"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-gray-500">{event.clientName}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 