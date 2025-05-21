import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ErrorBoundary } from 'react-error-boundary';

interface DueCheckIn {
  assignmentId: string;
  templateId: string;
  templateName: string;
  templateDescription: string;
  templateType: string;
  dueDate: string;
  frequency: string;
  customDays?: number;
  lastCheckInDate: string | null;
  startDate: string;
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="p-4 bg-red-900/50 border border-red-800 rounded-lg">
      <h3 className="text-lg font-medium text-red-200">Something went wrong</h3>
      <p className="mt-2 text-sm text-red-300">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded text-sm"
      >
        Try again
      </button>
    </div>
  );
}

function CheckInCard({ checkIn }: { checkIn: DueCheckIn }) {
  const isOverdue = new Date(checkIn.dueDate) < new Date();
  const daysUntilDue = Math.ceil(
    (new Date(checkIn.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className={`bg-gray-800 p-4 rounded-lg border ${
        isOverdue ? 'border-red-700' : 'border-gray-700'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-white">
            {checkIn.templateName}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {checkIn.templateDescription}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2 py-1 text-xs rounded-full bg-blue-900 text-blue-200">
              {checkIn.templateType}
            </span>
            <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
              {checkIn.frequency === 'custom'
                ? `Every ${checkIn.customDays} days`
                : checkIn.frequency}
            </span>
            {isOverdue && (
              <span className="px-2 py-1 text-xs rounded-full bg-red-900 text-red-200">
                Overdue
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/check-in/${checkIn.assignmentId}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          Start Check-in
        </Link>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="text-gray-400">
          {isOverdue ? (
            <span className="text-red-400">
              Overdue by {Math.abs(daysUntilDue)} days
            </span>
          ) : (
            <span>
              Due in {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'}
            </span>
          )}
        </div>
        {checkIn.lastCheckInDate && (
          <div className="text-gray-500">
            Last check-in: {new Date(checkIn.lastCheckInDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

export function DueCheckInsList() {
  const [dueCheckIns, setDueCheckIns] = useState<DueCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDueCheckIns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/template-assignments/due');
      
      if (!response.ok) {
        throw new Error('Failed to fetch due check-ins');
      }

      const data = await response.json();
      
      if (data.dueCheckIns) {
        setDueCheckIns(data.dueCheckIns);
      }

      if (data.meta?.errors) {
        console.warn('Some check-ins had errors:', data.meta.errors);
      }
    } catch (error) {
      console.error('Error fetching due check-ins:', error);
      setError(error instanceof Error ? error.message : 'Failed to load due check-ins');
      toast.error('Failed to load due check-ins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueCheckIns();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/50 border border-red-800 rounded-lg">
        <h3 className="text-lg font-medium text-red-200">Error</h3>
        <p className="mt-2 text-sm text-red-300">{error}</p>
        <button
          onClick={fetchDueCheckIns}
          className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  if (dueCheckIns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No check-ins due at the moment.</p>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={fetchDueCheckIns}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Due Check-ins</h2>
        <div className="grid gap-4">
          {dueCheckIns.map((checkIn) => (
            <CheckInCard key={checkIn.assignmentId} checkIn={checkIn} />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
} 