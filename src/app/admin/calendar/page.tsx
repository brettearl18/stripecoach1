'use client';

import { useState } from 'react';
import {
  CalendarIcon,
  PlusIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ClipboardDocumentCheckIcon,
  CameraIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import CalendarView from './components/CalendarView';
import NotificationSettings from './components/NotificationSettings';
import CalendarSettingsModal from './components/CalendarSettingsModal';

// Sample data - would come from backend in production
const eventTemplates = [
  {
    id: 1,
    title: "Weekly Check-in",
    description: "Regular progress check-in form submission",
    icon: ClipboardDocumentCheckIcon,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    frequency: "weekly",
    defaultTime: "09:00",
    type: "check-in"
  },
  {
    id: 2,
    title: "Body Measurements",
    description: "Monthly body measurements and progress photos",
    icon: CameraIcon,
    color: "text-green-600",
    bgColor: "bg-green-50",
    frequency: "monthly",
    defaultTime: "any",
    type: "measurement"
  },
  {
    id: 3,
    title: "Progress Review Call",
    description: "Monthly video call to review progress and adjust plans",
    icon: VideoCameraIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    frequency: "monthly",
    defaultTime: "14:30",
    type: "video-call"
  }
];

const clients = [
  { 
    id: 1, 
    name: "John Smith", 
    program: "Weight Management",
    calendarSync: {
      google: true,
      outlook: false,
      apple: false
    }
  },
  { 
    id: 2, 
    name: "Sarah Johnson", 
    program: "Strength Training",
    calendarSync: {
      google: false,
      outlook: true,
      apple: false
    }
  },
  { 
    id: 3, 
    name: "Mike Brown", 
    program: "Athletic Performance",
    calendarSync: {
      google: true,
      outlook: false,
      apple: true
    }
  }
];

export default function CalendarManagement() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: "weekly",
    dayOfWeek: "monday",
    dayOfMonth: "1",
    time: "09:00",
    startDate: new Date().toISOString().split('T')[0],
    syncToClientCalendars: true
  });
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar', 'schedule', 'notifications'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const handleSchedule = () => {
    // This would integrate with your backend to create the recurring events
    console.log('Scheduling events:', {
      template: selectedTemplate,
      clients: selectedClients,
      config: scheduleConfig
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-400';
      case 'completed':
        return 'bg-green-500/10 text-green-400';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <ClockIcon className="h-5 w-5 text-blue-400" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#13141A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
            <p className="text-gray-400">Manage your coaching sessions and events</p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
          >
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            Calendar Settings
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1b1e] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Today's Sessions</p>
                <h3 className="text-2xl font-bold text-white">8</h3>
                <p className="text-blue-400 text-sm mt-1">2 starting soon</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <VideoCameraIcon className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Coaches</p>
                <h3 className="text-2xl font-bold text-white">12</h3>
                <p className="text-green-400 text-sm mt-1">All coaches available</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Upcoming Sessions</p>
                <h3 className="text-2xl font-bold text-white">24</h3>
                <p className="text-purple-400 text-sm mt-1">Next 7 days</p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Events Table */}
        <div className="bg-[#1a1b1e] rounded-lg border border-gray-800">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Upcoming Events</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Event</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Time</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Coach</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4 text-gray-300">{event.title}</td>
                      <td className="py-3 px-4 text-gray-300">{event.type}</td>
                      <td className="py-3 px-4 text-gray-300">{event.date}</td>
                      <td className="py-3 px-4 text-gray-300">{event.time}</td>
                      <td className="py-3 px-4 text-gray-300">{event.coach}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {getStatusIcon(event.status)}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(event.status)}`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'calendar'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'schedule'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Schedule Events
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'notifications'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Notification Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'calendar' && (
          <CalendarView />
        )}

        {activeTab === 'notifications' && (
          <NotificationSettings />
        )}

        {activeTab === 'schedule' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Schedule Events</h1>
              <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Custom Event
              </button>
            </div>

            {/* Event Templates */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Event Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {eventTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`flex items-start p-4 rounded-lg border transition-colors ${
                      selectedTemplate?.id === template.id 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-indigo-500'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${template.bgColor} mr-3`}>
                      <template.icon className={`h-5 w-5 ${template.color}`} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-medium text-gray-900">{template.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                      <div className="flex items-center mt-2">
                        <ArrowPathIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500 capitalize">{template.frequency}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedTemplate && (
              <>
                {/* Client Selection */}
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Select Clients</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {clients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClients(prev => 
                          prev.includes(client.id) 
                            ? prev.filter(id => id !== client.id)
                            : [...prev, client.id]
                        )}
                        className={`flex items-start p-4 rounded-lg border transition-colors ${
                          selectedClients.includes(client.id)
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-500'
                        }`}
                      >
                        <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-left flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-900">{client.name}</div>
                            {Object.entries(client.calendarSync).map(([provider, isConnected]) => 
                              isConnected && (
                                <div 
                                  key={provider}
                                  className="flex items-center ml-2" 
                                  title={`Connected to ${provider} Calendar`}
                                >
                                  <div className={`w-2 h-2 rounded-full ${
                                    provider === 'google' ? 'bg-red-500' :
                                    provider === 'outlook' ? 'bg-blue-500' :
                                    'bg-gray-500'
                                  }`} />
                                </div>
                              )
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{client.program}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schedule Configuration */}
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Schedule Configuration</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                    {/* Calendar Sync Option */}
                    <div className="col-span-2">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={scheduleConfig.syncToClientCalendars}
                          onChange={(e) => setScheduleConfig(prev => ({
                            ...prev,
                            syncToClientCalendars: e.target.checked
                          }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Sync events to client calendars (when connected)
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frequency
                      </label>
                      <select
                        value={scheduleConfig.frequency}
                        onChange={(e) => setScheduleConfig(prev => ({ ...prev, frequency: e.target.value }))}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {scheduleConfig.frequency === 'weekly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Day of Week
                        </label>
                        <select
                          value={scheduleConfig.dayOfWeek}
                          onChange={(e) => setScheduleConfig(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="monday">Monday</option>
                          <option value="tuesday">Tuesday</option>
                          <option value="wednesday">Wednesday</option>
                          <option value="thursday">Thursday</option>
                          <option value="friday">Friday</option>
                          <option value="saturday">Saturday</option>
                          <option value="sunday">Sunday</option>
                        </select>
                      </div>
                    )}

                    {scheduleConfig.frequency === 'monthly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Day of Month
                        </label>
                        <select
                          value={scheduleConfig.dayOfMonth}
                          onChange={(e) => setScheduleConfig(prev => ({ ...prev, dayOfMonth: e.target.value }))}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          {[...Array(28)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={scheduleConfig.startDate}
                        onChange={(e) => setScheduleConfig(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        value={scheduleConfig.time}
                        onChange={(e) => setScheduleConfig(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSchedule}
                    disabled={selectedClients.length === 0}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Schedule Events
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Calendar Settings Modal */}
        <CalendarSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </div>
  );
} 