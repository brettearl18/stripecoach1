'use client';

import { useState, useEffect } from 'react';
import { AISettings } from '@/lib/types/ai';
import { getAISettings, saveAISettings } from '@/lib/services/aiSettingsService';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AISettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Partial<AISettings>>({
    businessTone: 'professional',
    communicationStyle: 'direct',
    keyBrandMessages: [],
    specificGuidelines: '',
    targetAudience: '',
    industryContext: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const existingSettings = await getAISettings(user!.uid);
      if (existingSettings) {
        setSettings(existingSettings);
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setSaving(true);
    try {
      await saveAISettings(user.uid, settings);
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving AI settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyBrandMessageAdd = () => {
    setSettings(prev => ({
      ...prev,
      keyBrandMessages: [...(prev.keyBrandMessages || []), '']
    }));
  };

  const handleKeyBrandMessageChange = (index: number, value: string) => {
    setSettings(prev => ({
      ...prev,
      keyBrandMessages: prev.keyBrandMessages?.map((msg, i) => 
        i === index ? value : msg
      )
    }));
  };

  const handleKeyBrandMessageRemove = (index: number) => {
    setSettings(prev => ({
      ...prev,
      keyBrandMessages: prev.keyBrandMessages?.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(16,24,40,0.08)] p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg font-semibold text-slate-700">AI Communication Settings</h2>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Business Tone
          </label>
          <select
            value={settings.businessTone}
            onChange={(e) => setSettings(prev => ({ ...prev, businessTone: e.target.value as AISettings['businessTone'] }))}
            className="w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="motivational">Motivational</option>
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Communication Style
          </label>
          <select
            value={settings.communicationStyle}
            onChange={(e) => setSettings(prev => ({ ...prev, communicationStyle: e.target.value as AISettings['communicationStyle'] }))}
            className="w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="direct">Direct</option>
            <option value="empathetic">Empathetic</option>
            <option value="encouraging">Encouraging</option>
            <option value="technical">Technical</option>
            <option value="simple">Simple</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Key Brand Messages
          </label>
          <div className="space-y-2">
            {settings.keyBrandMessages?.map((message, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => handleKeyBrandMessageChange(index, e.target.value)}
                  className="flex-1 rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter a key message"
                />
                <button
                  type="button"
                  onClick={() => handleKeyBrandMessageRemove(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleKeyBrandMessageAdd}
              className="text-indigo-600 hover:text-indigo-700"
            >
              + Add Message
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Specific Guidelines
          </label>
          <textarea
            value={settings.specificGuidelines}
            onChange={(e) => setSettings(prev => ({ ...prev, specificGuidelines: e.target.value }))}
            rows={4}
            className="w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter any specific guidelines for AI communication..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Target Audience
          </label>
          <input
            type="text"
            value={settings.targetAudience}
            onChange={(e) => setSettings(prev => ({ ...prev, targetAudience: e.target.value }))}
            className="w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Describe your target audience..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Industry Context
          </label>
          <input
            type="text"
            value={settings.industryContext}
            onChange={(e) => setSettings(prev => ({ ...prev, industryContext: e.target.value }))}
            className="w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Describe your industry context..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
} 