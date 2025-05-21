import { useState } from 'react';
import { toast } from 'sonner';
import PhotoUpload from './PhotoUpload';
import { uploadPhoto } from '@/lib/photoUpload';

interface CheckInFormProps {
  assignmentId: string;
  template: {
    id: string;
    name: string;
    description: string;
    type: string;
    fields: { key: string; label: string; type: string; required?: boolean }[];
  };
  onSuccess?: () => void;
}

export function CheckInForm({ assignmentId, template, onSuccess }: CheckInFormProps) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    template.fields.forEach((f) => {
      if (f.required && !form[f.key]) {
        newErrors[f.key] = `${f.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setUploading(true);
    try {
      // Upload all photos and get URLs
      const userId = undefined; // TODO: get current userId from session/context
      const uploaded = await Promise.all(
        photoFiles.map(file => uploadPhoto(file, userId || 'unknown', 'progress'))
      );
      const photoUrls = uploaded.map(p => p.url);
      setUploading(false);
      // Submit check-in
      const res = await fetch('/api/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          fields: form,
          photos: photoUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit check-in');
      toast.success('Check-in submitted!');
      setForm({});
      setPhotoFiles([]);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit check-in');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
      <p className="text-gray-400 mb-4">{template.description}</p>
      {template.fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type={field.type}
            value={form[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={`w-full px-3 py-2 rounded bg-gray-900 text-white border ${
              errors[field.key] ? 'border-red-500' : 'border-gray-700'
            }`}
            required={field.required}
          />
          {errors[field.key] && (
            <p className="mt-1 text-sm text-red-500">{errors[field.key]}</p>
          )}
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Progress Photos</label>
        <PhotoUpload onPhotosChange={setPhotoFiles} />
        {uploading && <p className="text-blue-400 mt-2">Uploading photos...</p>}
        {photoFiles.length > 0 && (
          <div className="flex gap-2 mt-2">
            {photoFiles.map((file, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(file)}
                alt="Progress preview"
                className="w-20 h-20 object-cover rounded"
              />
            ))}
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit Check-in'}
      </button>
    </form>
  );
} 