import { useState } from 'react';
import { TemplateEditModal } from './TemplateEditModal';
import { toast } from 'sonner';

interface TemplateListProps {
  templates: {
    id: string;
    name: string;
    description: string;
    type: string;
    fields: { key: string; label: string; type: string; required?: boolean }[];
  }[];
  onTemplateUpdated: (updated: any) => void;
}

export function TemplateList({ templates, onTemplateUpdated }: TemplateListProps) {
  const [editingTemplate, setEditingTemplate] = useState<null | any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [errorDelete, setErrorDelete] = useState('');
  const [localTemplates, setLocalTemplates] = useState(templates);

  const handleDelete = async (id: string) => {
    setLoadingDelete(true);
    setErrorDelete('');
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete template');
      setLocalTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template deleted');
      setDeletingId(null);
    } catch (err: any) {
      setErrorDelete(err.message || 'Failed to delete template');
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div>
      {localTemplates.map((template) => (
        <div key={template.id} className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <div className="font-semibold text-white">{template.name}</div>
            <div className="text-gray-400 text-sm">{template.description}</div>
          </div>
          <div className="flex gap-2">
            <button
              className="text-blue-400 hover:text-blue-600"
              onClick={() => setEditingTemplate(template)}
              aria-label="Edit Template"
            >
              ✏️ Edit
            </button>
            <button
              className="text-red-400 hover:text-red-600"
              onClick={() => setDeletingId(template.id)}
              aria-label="Delete Template"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}
      {editingTemplate && (
        <TemplateEditModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={updated => {
            setEditingTemplate(null);
            onTemplateUpdated(updated);
            setLocalTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
          }}
          allowTypeAndFieldsEdit={true}
        />
      )}
      {deletingId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Template</h3>
            <p className="text-gray-300 mb-4">Are you sure you want to delete this template? This action cannot be undone.</p>
            {errorDelete && <div className="text-red-500 mb-2">{errorDelete}</div>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded"
                disabled={loadingDelete}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 bg-red-600 text-white rounded"
                disabled={loadingDelete}
              >
                {loadingDelete ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 