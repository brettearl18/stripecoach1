import { useState } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, ClockIcon, UserGroupIcon, ChartBarIcon, CalendarIcon, ArrowPathIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface TemplateSettingsProps {
  initialData: {
    notifications?: boolean;
    reminders?: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
    customFrequency?: {
      value: number;
      unit: 'days' | 'weeks' | 'months';
    };
    autoAssign: boolean;
    reminderDays: number[];
    completionWindow: number;
    responseVisibility: 'coach' | 'client' | 'both';
    autoAnalyze: boolean;
    scheduleStart?: string;
    scheduleEnd?: string;
  };
  onSave: (data: {
    notifications: boolean;
    reminders: boolean;
    frequency: string;
    customFrequency?: {
      value: number;
      unit: string;
    };
    autoAssign: boolean;
    reminderDays: number[];
    completionWindow: number;
    responseVisibility: 'coach' | 'client' | 'both';
    autoAnalyze: boolean;
    scheduleStart?: string;
    scheduleEnd?: string;
  }) => void;
}

export default function TemplateSettings({ initialData, onSave }: TemplateSettingsProps) {
  const [notifications, setNotifications] = useState(initialData.notifications ?? true);
  const [reminders, setReminders] = useState(initialData.reminders ?? true);
  const [frequency, setFrequency] = useState(initialData.frequency ?? 'weekly');
  const [customFrequency, setCustomFrequency] = useState(initialData.customFrequency ?? {
    value: 2,
    unit: 'weeks'
  });
  const [autoAssign, setAutoAssign] = useState(initialData.autoAssign ?? false);
  const [reminderDays, setReminderDays] = useState(initialData.reminderDays ?? [2]);
  const [completionWindow, setCompletionWindow] = useState(initialData.completionWindow ?? 7);
  const [responseVisibility, setResponseVisibility] = useState(initialData.responseVisibility ?? 'both');
  const [autoAnalyze, setAutoAnalyze] = useState(initialData.autoAnalyze ?? true);
  const [scheduleStart, setScheduleStart] = useState(initialData.scheduleStart);
  const [scheduleEnd, setScheduleEnd] = useState(initialData.scheduleEnd);

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom Schedule' }
  ];

  const handleSave = () => {
    onSave({
      notifications,
      reminders,
      frequency,
      ...(frequency === 'custom' ? { customFrequency } : {}),
      autoAssign,
      reminderDays,
      completionWindow,
      responseVisibility,
      autoAnalyze,
      scheduleStart,
      scheduleEnd
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Template Settings</h2>
        <p className="text-gray-400">
          Configure how this template behaves when assigned to clients.
        </p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="bg-[#1C1C1F] rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Notifications</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-white">Enable Notifications</span>
                <p className="text-sm text-gray-400">
                  Send notifications when check-ins are due
                </p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="text-white">Enable Reminders</span>
                <p className="text-sm text-gray-400">
                  Send reminder notifications for overdue check-ins
                </p>
              </div>
              <button
                onClick={() => setReminders(!reminders)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  reminders ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    reminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Check-in Frequency */}
        <div className="bg-[#1C1C1F] rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Check-in Frequency</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFrequency('daily')}
              className={`p-4 rounded-lg border ${
                frequency === 'daily'
                  ? 'border-indigo-500 bg-indigo-500/10 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setFrequency('weekly')}
              className={`p-4 rounded-lg border ${
                frequency === 'weekly'
                  ? 'border-indigo-500 bg-indigo-500/10 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setFrequency('monthly')}
              className={`p-4 rounded-lg border ${
                frequency === 'monthly'
                  ? 'border-indigo-500 bg-indigo-500/10 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setFrequency('custom')}
              className={`p-4 rounded-lg border ${
                frequency === 'custom'
                  ? 'border-indigo-500 bg-indigo-500/10 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              Custom
            </button>
          </div>

          {frequency === 'custom' && (
            <div className="mt-4 flex items-center gap-4">
              <input
                type="number"
                min="1"
                value={customFrequency.value}
                onChange={(e) =>
                  setCustomFrequency({
                    ...customFrequency,
                    value: parseInt(e.target.value) || 1
                  })
                }
                className="bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white w-24"
              />
              <select
                value={customFrequency.unit}
                onChange={(e) =>
                  setCustomFrequency({
                    ...customFrequency,
                    unit: e.target.value as 'days' | 'weeks' | 'months'
                  })
                }
                className="bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          )}
        </div>

        {/* Schedule & Frequency */}
        <div className="bg-[#1C1C1F] rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <ClockIcon className="w-6 h-6 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">Schedule & Frequency</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Completion Window (days)
              </label>
              <input
                type="number"
                value={completionWindow}
                onChange={e => setCompletionWindow(parseInt(e.target.value) || 7)}
                min={1}
                max={30}
                className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>

            {frequency === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={scheduleStart}
                    onChange={e => setScheduleStart(e.target.value)}
                    className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={scheduleEnd}
                    onChange={e => setScheduleEnd(e.target.value)}
                    className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Response Settings */}
        <div className="bg-[#1C1C1F] rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <UserGroupIcon className="w-6 h-6 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">Response Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Response Visibility
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['coach', 'client', 'both'].map(option => (
                  <button
                    key={option}
                    onClick={() => setResponseVisibility(option as any)}
                    className={`px-4 py-2 rounded-lg text-sm capitalize ${
                      responseVisibility === option
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#2C2C30] text-gray-400 hover:text-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between">
              <span className="text-gray-300">Auto-assign to new clients</span>
              <button
                onClick={() => setAutoAssign(!autoAssign)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoAssign ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoAssign ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-[#1C1C1F] rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="w-6 h-6 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">AI Analysis</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 block">Automatic AI Analysis</span>
                <span className="text-sm text-gray-500">Generate insights when responses are submitted</span>
              </div>
              <button
                onClick={() => setAutoAnalyze(!autoAnalyze)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoAnalyze ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoAnalyze ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          Save Template
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
} 