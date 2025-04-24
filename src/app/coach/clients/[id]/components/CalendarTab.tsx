'use client';

import { useState } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  MapPinIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface TabContentProps {
  client: any;
}

interface Appointment {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'video' | 'in-person' | 'check-in';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Weekly Check-in',
    date: new Date(),
    time: '10:00 AM',
    type: 'video',
    status: 'scheduled',
    notes: 'Review progress and adjust plan'
  },
  {
    id: '2',
    title: 'Training Session',
    date: addDays(new Date(), 2),
    time: '2:00 PM',
    type: 'in-person',
    status: 'scheduled',
    notes: 'Focus on strength training'
  },
  {
    id: '3',
    title: 'Monthly Assessment',
    date: addDays(new Date(), 5),
    time: '11:30 AM',
    type: 'check-in',
    status: 'scheduled',
    notes: 'Comprehensive progress review'
  }
];

export default function CalendarTab({ client }: TabContentProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  // Generate week view
  const startOfCurrentWeek = startOfWeek(selectedDate);
  const weekDays = [...Array(7)].map((_, i) => addDays(startOfCurrentWeek, i));

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.date), date));
  };

  const getAppointmentTypeIcon = (type: Appointment['type']) => {
    switch (type) {
      case 'video':
        return <VideoCameraIcon className="h-4 w-4" />;
      case 'in-person':
        return <MapPinIcon className="h-4 w-4" />;
      case 'check-in':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Schedule</h2>
          <button
            onClick={() => setShowNewAppointment(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Appointment
          </button>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((date) => (
            <div
              key={date.toString()}
              className={`p-2 text-center rounded-lg cursor-pointer transition-colors ${
                isSameDay(date, selectedDate)
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700'
              }`}
              onClick={() => setSelectedDate(date)}
            >
              <div className="text-xs text-gray-400 mb-1">
                {format(date, 'EEE')}
              </div>
              <div className="font-semibold">
                {format(date, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Appointments for Selected Date */}
        <div className="space-y-3">
          {getAppointmentsForDate(selectedDate).map((apt) => (
            <div
              key={apt.id}
              className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-600 rounded-lg">
                  {getAppointmentTypeIcon(apt.type)}
                </div>
                <div>
                  <h3 className="font-medium text-white">{apt.title}</h3>
                  <p className="text-sm text-gray-400">{apt.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  apt.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  apt.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {apt.status}
                </span>
                <button className="p-1 hover:bg-gray-600 rounded-lg transition-colors">
                  <XMarkIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
          {getAppointmentsForDate(selectedDate).length === 0 && (
            <div className="text-center py-6 text-gray-400">
              No appointments scheduled for this date
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Appointments</h3>
        <div className="space-y-3">
          {appointments
            .filter(apt => new Date(apt.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map(apt => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-600 rounded-lg">
                    {getAppointmentTypeIcon(apt.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{apt.title}</h4>
                    <p className="text-sm text-gray-400">
                      {format(new Date(apt.date), 'MMM d')} at {apt.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-1 hover:bg-green-600/20 text-green-400 rounded-lg transition-colors"
                    title="Mark as completed"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors"
                    title="Cancel appointment"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
} 