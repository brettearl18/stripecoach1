import { useState } from 'react';
import { toast } from 'sonner';

interface Assignment {
  id: string;
  clientId: string;
  clientName?: string;
  templateId: string;
  templateName?: string;
  frequency: string;
  customDays?: number;
  startDate: string;
  active: boolean;
  nextDueDate: string;
}

interface AssignmentListProps {
  assignments: Assignment[];
  onAssignmentUpdated: (updated: Assignment) => void;
}

function formatFrequency(frequency: string, customDays?: number) {
  if (frequency === 'custom') return `Every ${customDays} days`;
  return frequency.charAt(0).toUpperCase() + frequency.slice(1);
}

export function AssignmentList({ assignments, onAssignmentUpdated }: AssignmentListProps) {
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [deleting, setDeleting] = useState<Assignment | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [errorDelete, setErrorDelete] = useState('');
  const [localAssignments, setLocalAssignments] = useState(assignments);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [errorEdit, setErrorEdit] = useState('');

  const handleDelete = async (id: string) => {
    setLoadingDelete(true);
    setErrorDelete('');
    try {
      const res = await fetch(`/api/template-assignments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete assignment');
      setLocalAssignments(prev => prev.filter(a => a.id !== id));
      toast.success('Assignment deleted');
      setDeleting(null);
    } catch (err: any) {
      setErrorDelete(err.message || 'Failed to delete assignment');
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setLoadingEdit(true);
    setErrorEdit('');
    try {
      const res = await fetch(`/api/template-assignments/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error('Failed to update assignment');
      const updated = await res.json();
      setLocalAssignments(prev => prev.map(a => a.id === updated.id ? updated : a));
      onAssignmentUpdated(updated);
      toast.success('Assignment updated');
      setEditing(null);
    } catch (err: any) {
      setErrorEdit(err.message || 'Failed to update assignment');
    } finally {
      setLoadingEdit(false);
    }
  };

  return (
    <div className="space-y-4">
      {localAssignments.map((assignment) => (
        <div key={assignment.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border-b border-gray-700 gap-2">
          <div>
            <div className="font-semibold text-white flex items-center gap-2">
              {assignment.clientName || assignment.clientId} — {assignment.templateName || assignment.templateId}
              {assignment.active ? (
                <span className="ml-2 px-2 py-1 text-xs rounded bg-green-700 text-green-100">Active</span>
              ) : (
                <span className="ml-2 px-2 py-1 text-xs rounded bg-gray-700 text-gray-300">Inactive</span>
              )}
            </div>
            <div className="text-gray-400 text-sm">
              {formatFrequency(assignment.frequency, assignment.customDays)}
            </div>
            <div className="text-gray-400 text-sm">Start: {new Date(assignment.startDate).toLocaleDateString()}</div>
            <div className="text-gray-400 text-sm">Next Due: {new Date(assignment.nextDueDate).toLocaleDateString()}</div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              className="text-blue-400 hover:text-blue-600"
              onClick={() => setEditing(assignment)}
              aria-label={`Edit assignment for ${assignment.clientName || assignment.clientId}`}
            >
              ✏️ Edit
            </button>
            <button
              className="text-red-400 hover:text-red-600"
              onClick={() => setDeleting(assignment)}
              aria-label={`Delete assignment for ${assignment.clientName || assignment.clientId}`}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Assignment</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Frequency</label>
                <select
                  value={editing.frequency}
                  onChange={e => setEditing({ ...editing, frequency: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
                  required
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              {editing.frequency === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Custom Days</label>
                  <input
                    type="number"
                    min={1}
                    value={editing.customDays || ''}
                    onChange={e => setEditing({ ...editing, customDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={editing.startDate}
                  onChange={e => setEditing({ ...editing, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
                  required
                />
              </div>
              {errorEdit && <div className="text-red-500 mb-2">{errorEdit}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-700 text-white rounded" disabled={loadingEdit}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loadingEdit}>{loadingEdit ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Assignment</h3>
            <p className="text-gray-300 mb-2">
              Are you sure you want to delete the assignment for <b>{deleting.clientName || deleting.clientId}</b> — <b>{deleting.templateName || deleting.templateId}</b>?
            </p>
            {deleting.active && (
              <p className="text-yellow-400 mb-2">Warning: This assignment is currently active.</p>
            )}
            {errorDelete && <div className="text-red-500 mb-2">{errorDelete}</div>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded"
                disabled={loadingDelete}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleting.id)}
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