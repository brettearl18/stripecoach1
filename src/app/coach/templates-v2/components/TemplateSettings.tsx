import { useState } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, ClockIcon, UserGroupIcon, ChartBarIcon, CalendarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface TemplateSettingsProps {
  initialData: {
    notifications: boolean;
    reminders: boolean;
    frequency: string;
    autoAssign: boolean;
    reminderDays: number[];
    completionWindow: number;
    responseVisibility: 'coach' | 'client' | 'both';
    autoAnalyze: boolean;
    scheduleStart?: string;
    scheduleEnd?: string;
  };
  onSave: (settings: any) => void;
}

export default function TemplateSettings({ initialData, onSave }: TemplateSettingsProps) {
  const [settings, setSettings] = useState({
    notifications: initialData.notifications ?? true,
    reminders: initialData.reminders ?? true,
    frequency: initialData.frequency ?? 'weekly',
    autoAssign: initialData.autoAssign ?? false,
    reminderDays: initialData.reminderDays ?? [2], // Default to 2 days before due
    completionWindow: initialData.completionWindow ?? 7,
    responseVisibility: initialData.responseVisibility ?? 'both',
    autoAnalyze: initialData.autoAnalyze ?? true,
    scheduleStart: initialData.scheduleStart,
    scheduleEnd: initialData.scheduleEnd,
  });

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom Schedule' }
  ];

  const handleSubmit = () => {
    onSave(settings);
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
          Configure how this template will be used and managed
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Notifications & Reminders */}
        <div className="bg-[#1C1C1F] rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <BellIcon className="w-6 h-6 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">Notifications & Reminders</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Enable notifications</span>
              <button
                onClick={() => setSettings(s => ({ ...s, notifications: !s.notifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <span className="text-gray-300">Enable reminders</span>
              <button
                onClick={() => setSettings(s => ({ ...s, reminders: !s.reminders }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.reminders ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.reminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            {settings.reminders && (
              <div className="pl-6 space-y-3">
                <p className="text-sm text-gray-400">Send reminders before due date:</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 5, 7].map(days => (
                    <button
                      key={days}
                      onClick={() => {
                        const newDays = settings.reminderDays.includes(days)
                          ? settings.reminderDays.filter(d => d !== days)
                          : [...settings.reminderDays, days];
                        setSettings(s => ({ ...s, reminderDays: newDays }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        settings.reminderDays.includes(days)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-[#2C2C30] text-gray-400 hover:text-white'
                      }`}
                    >
                      {days} {days === 1 ? 'day' : 'days'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
                Check-in Frequency
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {frequencyOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSettings(s => ({ ...s, frequency: option.value }))}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      settings.frequency === option.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#2C2C30] text-gray-400 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Completion Window (days)
              </label>
              <input
                type="number"
                value={settings.completionWindow}
                onChange={e => setSettings(s => ({ ...s, completionWindow: parseInt(e.target.value) || 7 }))}
                min={1}
                max={30}
                className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>

            {settings.frequency === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={settings.scheduleStart}
                    onChange={e => setSettings(s => ({ ...s, scheduleStart: e.target.value }))}
                    className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={settings.scheduleEnd}
                    onChange={e => setSettings(s => ({ ...s, scheduleEnd: e.target.value }))}
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
                    onClick={() => setSettings(s => ({ ...s, responseVisibility: option as any }))}
                    className={`px-4 py-2 rounded-lg text-sm capitalize ${
                      settings.responseVisibility === option
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
                onClick={() => setSettings(s => ({ ...s, autoAssign: !s.autoAssign }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoAssign ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoAssign ? 'translate-x-6' : 'translate-x-1'
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
                onClick={() => setSettings(s => ({ ...s, autoAnalyze: !s.autoAnalyze }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoAnalyze ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoAnalyze ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          Save Settings
        </button>
      </div>
    </motion.div>
  );
} 