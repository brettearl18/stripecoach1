'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { TemplateForm } from '@/components/checkIn/TemplateForm';
import type { CheckInTemplate } from '@/types/checkIn';
import Link from 'next/link';

const MEASUREMENT_OPTIONS = [
  { id: 'weight', label: 'Weight (kg)' },
  { id: 'waist', label: 'Waist (cm)' },
  { id: 'chest', label: 'Chest (cm)' },
  { id: 'hips', label: 'Hips (cm)' },
  { id: 'leftArm', label: 'Left Arm (cm)' },
  { id: 'rightArm', label: 'Right Arm (cm)' },
  { id: 'leftThigh', label: 'Left Thigh (cm)' },
  { id: 'rightThigh', label: 'Right Thigh (cm)' },
];

const TEMPLATE_TYPES = [
  { id: 'regular', label: 'Regular Check-In' },
  { id: 'measurement', label: 'Body Measurement' },
  { id: 'progress-photo', label: 'Progress Photo' },
];

const FREQUENCIES = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'custom', label: 'Custom (days)' },
];

function TemplatesList({ refreshKey }: { refreshKey: number }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load templates');
        setLoading(false);
      });
  }, [refreshKey]);

  if (loading) return <div>Loading templates...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Your Templates</h2>
      <ul className="space-y-2">
        {templates.map(t => (
          <li key={t.id} className="p-3 bg-gray-800 rounded-lg text-white">
            <div className="font-bold">{t.title}</div>
            <div className="text-sm text-gray-400">{t.description}</div>
          </li>
        ))}
        {templates.length === 0 && <li className="text-gray-400">No templates found.</li>}
      </ul>
    </div>
  );
}

function NewTemplateForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('regular');
  const [frequency, setFrequency] = useState('weekly');
  const [customDays, setCustomDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<string[]>([]);

  const handleMeasurementChange = (id: string) => {
    setMeasurements(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const templateData: any = {
      title,
      description: desc,
      type,
      defaultFrequency: frequency === 'custom' ? customDays : frequency,
    };
    if (type === 'measurement') {
      templateData.measurements = measurements;
    }
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateData })
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      onCreated();
      setTitle('');
      setDesc('');
      setType('regular');
      setFrequency('weekly');
      setCustomDays('');
      setMeasurements([]);
    } else {
      setError(data.error || 'Failed to create template');
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-2 bg-gray-800 p-4 rounded-lg">
      <div>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-700"
        />
      </div>
      <div>
        <input
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Description"
          className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-700"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Template Type</label>
        <div className="flex gap-4">
          {TEMPLATE_TYPES.map(opt => (
            <label key={opt.id} className="flex items-center gap-2 text-gray-200">
              <input
                type="radio"
                name="templateType"
                value={opt.id}
                checked={type === opt.id}
                onChange={() => setType(opt.id)}
                className="accent-blue-600"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      {type === 'measurement' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Body Measurements</label>
          <div className="flex flex-wrap gap-3">
            {MEASUREMENT_OPTIONS.map(opt => (
              <label key={opt.id} className="flex items-center gap-2 text-gray-200">
                <input
                  type="checkbox"
                  checked={measurements.includes(opt.id)}
                  onChange={() => handleMeasurementChange(opt.id)}
                  className="accent-blue-600"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Default Frequency</label>
        <div className="flex gap-4">
          {FREQUENCIES.map(opt => (
            <label key={opt.id} className="flex items-center gap-2 text-gray-200">
              <input
                type="radio"
                name="frequency"
                value={opt.id}
                checked={frequency === opt.id}
                onChange={() => setFrequency(opt.id)}
                className="accent-blue-600"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {frequency === 'custom' && (
          <input
            type="number"
            min={1}
            value={customDays}
            onChange={e => setCustomDays(e.target.value)}
            placeholder="Enter number of days"
            className="w-40 mt-2 px-3 py-2 rounded bg-gray-900 text-white border border-gray-700"
          />
        )}
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {loading ? 'Creating...' : 'Create Template'}
      </button>
    </form>
  );
}

export default function TemplatesPage() {
  const [refresh, setRefresh] = useState(0);
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Templates</h1>
      <NewTemplateForm onCreated={() => setRefresh(r => r + 1)} />
      <TemplatesList refreshKey={refresh} />
    </div>
  );
} 