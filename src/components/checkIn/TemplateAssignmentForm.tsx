import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface TemplateAssignmentFormProps {
  onSuccess?: () => void;
}

// Form validation schema
const formSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  templateId: z.string().min(1, 'Please select a template'),
  frequency: z.enum(['weekly', 'monthly', 'custom']),
  customDays: z.number().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Please select a valid start date'
  })
});

export function TemplateAssignmentForm({ onSuccess }: TemplateAssignmentFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'custom'>('weekly');
  const [customDays, setCustomDays] = useState('');
  const [startDate, setStartDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch clients and templates
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        const [clientsRes, templatesRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/templates')
        ]);

        if (!clientsRes.ok || !templatesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const clientsData = await clientsRes.json();
        const templatesData = await templatesRes.json();

        setClients(clientsData.clients || []);
        setTemplates(templatesData.templates || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load clients and templates');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  const validateForm = () => {
    try {
      formSchema.parse({
        clientId: selectedClient,
        templateId: selectedTemplate,
        frequency,
        customDays: frequency === 'custom' ? parseInt(customDays) : undefined,
        startDate
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/template-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient,
          templateId: selectedTemplate,
          frequency,
          customDays: frequency === 'custom' ? parseInt(customDays) : undefined,
          startDate
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign template');
      }

      toast.success('Template assigned successfully');
      setSelectedClient('');
      setSelectedTemplate('');
      setFrequency('weekly');
      setCustomDays('');
      setStartDate('');
      onSuccess?.();
    } catch (error) {
      console.error('Error assigning template:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign template');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Select Client
        </label>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className={`w-full px-3 py-2 rounded bg-gray-900 text-white border ${
            errors.clientId ? 'border-red-500' : 'border-gray-700'
          }`}
          required
        >
          <option value="">Choose a client...</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.email})
            </option>
          ))}
        </select>
        {errors.clientId && (
          <p className="mt-1 text-sm text-red-500">{errors.clientId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Select Template
        </label>
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className={`w-full px-3 py-2 rounded bg-gray-900 text-white border ${
            errors.templateId ? 'border-red-500' : 'border-gray-700'
          }`}
          required
        >
          <option value="">Choose a template...</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} ({template.type})
            </option>
          ))}
        </select>
        {errors.templateId && (
          <p className="mt-1 text-sm text-red-500">{errors.templateId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Frequency
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-gray-200">
            <input
              type="radio"
              name="frequency"
              value="weekly"
              checked={frequency === 'weekly'}
              onChange={() => setFrequency('weekly')}
              className="accent-blue-600"
            />
            Weekly
          </label>
          <label className="flex items-center gap-2 text-gray-200">
            <input
              type="radio"
              name="frequency"
              value="monthly"
              checked={frequency === 'monthly'}
              onChange={() => setFrequency('monthly')}
              className="accent-blue-600"
            />
            Monthly
          </label>
          <label className="flex items-center gap-2 text-gray-200">
            <input
              type="radio"
              name="frequency"
              value="custom"
              checked={frequency === 'custom'}
              onChange={() => setFrequency('custom')}
              className="accent-blue-600"
            />
            Custom
          </label>
        </div>
        {frequency === 'custom' && (
          <div>
            <input
              type="number"
              min={1}
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              placeholder="Enter number of days"
              className={`w-40 mt-2 px-3 py-2 rounded bg-gray-900 text-white border ${
                errors.customDays ? 'border-red-500' : 'border-gray-700'
              }`}
              required
            />
            {errors.customDays && (
              <p className="mt-1 text-sm text-red-500">{errors.customDays}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={`w-full px-3 py-2 rounded bg-gray-900 text-white border ${
            errors.startDate ? 'border-red-500' : 'border-gray-700'
          }`}
          required
        />
        {errors.startDate && (
          <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Assigning...
          </span>
        ) : (
          'Assign Template'
        )}
      </button>
    </form>
  );
} 