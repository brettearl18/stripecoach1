import { useEffect, useState } from 'react';

interface CheckInHistoryProps {
  assignmentId: string;
}

interface CheckIn {
  id: string;
  createdAt: string;
  fields: Record<string, any>;
  photos: string[];
}

export function CheckInHistory({ assignmentId }: CheckInHistoryProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/check-ins?assignmentId=${assignmentId}`);
        if (!res.ok) throw new Error('Failed to fetch check-in history');
        const data = await res.json();
        setCheckIns(data);
      } catch (err) {
        setError('Could not load check-in history.');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [assignmentId]);

  if (loading) return <div className="text-center py-8">Loading check-in history...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (checkIns.length === 0) return <div className="text-center py-8 text-gray-400">No previous check-ins yet.</div>;

  return (
    <div className="space-y-4 mt-6">
      <h4 className="text-lg font-semibold text-white mb-2">Previous Check-ins</h4>
      {checkIns.map((checkIn) => (
        <div key={checkIn.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300 font-medium">
              {new Date(checkIn.createdAt).toLocaleString()}
            </span>
            {checkIn.photos.length > 0 && (
              <div className="flex gap-2">
                {checkIn.photos.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Progress photo"
                    className="w-16 h-16 object-cover rounded border border-gray-700"
                  />
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {Object.entries(checkIn.fields).map(([key, value]) => (
              <div key={key} className="text-sm text-gray-400">
                <span className="font-medium text-gray-300">{key}:</span> {value}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 