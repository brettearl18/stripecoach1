'use client';

import { useState } from 'react';
import { BellIcon, EnvelopeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

interface NotificationSetting {
  id: string;
  type: 'email' | 'push' | 'sms';
  enabled: boolean;
  timing: number; // minutes before event
}

const defaultSettings: NotificationSetting[] = [
  { id: 'email-24h', type: 'email', enabled: true, timing: 1440 }, // 24 hours
  { id: 'email-1h', type: 'email', enabled: true, timing: 60 }, // 1 hour
  { id: 'push-15m', type: 'push', enabled: true, timing: 15 }, // 15 minutes
  { id: 'sms-1h', type: 'sms', enabled: false, timing: 60 } // 1 hour
];

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>(defaultSettings);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSetting, setNewSetting] = useState<Partial<NotificationSetting>>({
    type: 'email',
    timing: 60,
    enabled: true
  });

  const formatTiming = (minutes: number) => {
    if (minutes >= 1440) {
      return `${minutes / 1440} days`;
    }
    if (minutes >= 60) {
      return `${minutes / 60} hours`;
    }
    return `${minutes} minutes`;
  };

  const handleToggle = (id: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const handleAddSetting = () => {
    if (!newSetting.type || !newSetting.timing) return;

    const id = `${newSetting.type}-${newSetting.timing}m`;
    const setting: NotificationSetting = {
      id,
      type: newSetting.type as 'email' | 'push' | 'sms',
      timing: newSetting.timing,
      enabled: newSetting.enabled || false
    };

    setSettings(prev => [...prev, setting]);
    setShowAddForm(false);
    setNewSetting({ type: 'email', timing: 60, enabled: true });
  };

  const handleDelete = (id: string) => {
    setSettings(prev => prev.filter(setting => setting.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add Notification
          </button>
        </div>

        <div className="space-y-4">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  setting.type === 'email' ? 'bg-blue-50' :
                  setting.type === 'push' ? 'bg-green-50' :
                  'bg-purple-50'
                }`}>
                  {setting.type === 'email' ? (
                    <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                  ) : setting.type === 'push' ? (
                    <BellIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <DevicePhoneMobileIcon className="h-5 w-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {setting.type.toUpperCase()} Notification
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTiming(setting.timing)} before event
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={setting.enabled}
                    onChange={() => handleToggle(setting.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </label>
                <button
                  onClick={() => handleDelete(setting.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {showAddForm && (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Add New Notification</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newSetting.type}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="email">Email</option>
                  <option value="push">Push</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Before Event
                </label>
                <select
                  value={newSetting.timing}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, timing: Number(e.target.value) }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="1440">24 hours</option>
                  <option value="2880">2 days</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAddSetting}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 