import { useState } from 'react';

interface TemplateEditModalProps {
  template: {
    id: string;
    name: string;
    description: string;
    type: string;
    fields: { key: string; label: string; type: string; required?: boolean }[];
  };
  onClose: () => void;
  onSave: (updated: any) => void;
  allowTypeAndFieldsEdit?: boolean;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Checkbox' },
];

export function TemplateEditModal({ template, onClose, onSave, allowTypeAndFieldsEdit }: TemplateEditModalProps) {
  const [form, setForm] = useState({ ...template });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleFieldChange = (idx: number, key: string, value: any) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === idx ? { ...f, [key]: value } : f)),
    }));
  };

  const addField = () => {
    setForm(prev => ({
      ...prev,
      fields: [
        ...prev.fields,
        { key: '', label: '', type: 'text', required: false },
      ],
    }));
  };

  const removeField = (idx: number) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== idx),
    }));
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.description.trim()) return false;
    if (allowTypeAndFieldsEdit) {
      for (const field of form.fields) {
        if (!field.key.trim() || !field.label.trim() || !field.type) return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please fill out all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update template');
      const updated = await res.json();
      onSave(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Edit Template</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
              required
            />
          </div>
          {allowTypeAndFieldsEdit && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <input
                  type="text"
                  value={form.type}
                  onChange={e => handleChange('type', e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Fields</label>
                <div className="space-y-2">
                  {form.fields.map((field, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Key"
                        value={field.key}
                        onChange={e => handleFieldChange(idx, 'key', e.target.value)}
                        className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-700 w-1/5"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        value={field.label}
                        onChange={e => handleFieldChange(idx, 'label', e.target.value)}
                        className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-700 w-2/5"
                        required
                      />
                      <select
                        value={field.type}
                        onChange={e => handleFieldChange(idx, 'type', e.target.value)}
                        className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-700 w-1/5"
                        required
                      >
                        {FIELD_TYPES.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1 text-gray-300 text-xs">
                        <input
                          type="checkbox"
                          checked={!!field.required}
                          onChange={e => handleFieldChange(idx, 'required', e.target.checked)}
                        />
                        Required
                      </label>
                      <button type="button" onClick={() => removeField(idx)} className="text-red-400 ml-1">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={addField} className="text-blue-400 mt-2">+ Add Field</button>
                </div>
              </div>
            </>
          )}
          {error && <div className="text-red-500">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 