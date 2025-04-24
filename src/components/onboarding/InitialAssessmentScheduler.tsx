import { useState } from 'react';
import { CalendarIcon, ClockIcon, VideoCameraIcon, UserIcon } from '@heroicons/react/24/outline';
import { format, addDays, setHours, setMinutes } from 'date-fns';

interface TimeSlot {
  date: Date;
  available: boolean;
}

interface InitialAssessmentSchedulerProps {
  clientId: string;
  coachId: string;
  onScheduled: (scheduledTime: Date) => void;
}

export default function InitialAssessmentScheduler({ clientId, coachId, onScheduled }: InitialAssessmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate next 7 days of available slots
  const availableDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

  // Generate time slots from 9 AM to 5 PM
  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minutes = (i % 2) * 30;
    return format(setMinutes(setHours(new Date(), hour), minutes), 'h:mm a');
  });

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':');
      const scheduledDateTime = setMinutes(
        setHours(selectedDate, parseInt(hours, 10)),
        parseInt(minutes, 10)
      );

      const response = await fetch('/api/assessments/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          coachId,
          scheduledTime: scheduledDateTime.toISOString(),
          type: 'initial_assessment'
        })
      });

      if (!response.ok) throw new Error('Failed to schedule assessment');

      onScheduled(scheduledDateTime);
    } catch (error) {
      console.error('Error scheduling assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        Schedule Initial Assessment
      </h3>

      {/* Date Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Date
        </label>
        <div className="grid grid-cols-7 gap-2">
          {availableDates.map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`p-3 rounded-lg text-center transition-colors ${
                selectedDate?.toDateString() === date.toDateString()
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <div className="text-xs mb-1">{format(date, 'EEE')}</div>
              <div className="text-sm font-semibold">{format(date, 'd')}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Time
          </label>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-2 rounded-lg text-center text-sm transition-colors ${
                  selectedTime === time
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Meeting Details */}
      {selectedDate && selectedTime && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Meeting Details
          </h4>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              <span>{selectedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <VideoCameraIcon className="w-4 h-4" />
              <span>Video Call (link will be sent via email)</span>
            </div>
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>60 minutes</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSchedule}
        disabled={!selectedDate || !selectedTime || loading}
        className={`w-full py-2 px-4 rounded-lg text-white text-sm font-medium transition-colors ${
          !selectedDate || !selectedTime || loading
            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {loading ? 'Scheduling...' : 'Schedule Assessment'}
      </button>
    </div>
  );
} 