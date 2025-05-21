import { useState } from 'react';
import { CheckInForm } from './CheckInForm';
import { CheckInHistory } from './CheckInHistory';

interface CheckInDashboardProps {
  assignmentId: string;
  template: {
    id: string;
    name: string;
    description: string;
    type: string;
    fields: { key: string; label: string; type: string; required?: boolean }[];
  };
}

export function CheckInDashboard({ assignmentId, template }: CheckInDashboardProps) {
  const [historyKey, setHistoryKey] = useState(0);

  // When a check-in is submitted, refresh the history by updating the key
  const handleSuccess = () => {
    setHistoryKey((k) => k + 1);
  };

  if (!template) {
    return <div className="text-center py-8 text-gray-400">Loading template...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <CheckInForm assignmentId={assignmentId} template={template} onSuccess={handleSuccess} />
      <CheckInHistory key={historyKey} assignmentId={assignmentId} />
    </div>
  );
} 