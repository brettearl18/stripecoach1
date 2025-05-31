import { useEffect, useState } from 'react';
import { getPaginatedClientsWithCompliance } from '@/lib/firebase/coachAnalytics';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const TRAFFIC_COLORS = {
  green: 'bg-green-400',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
  gray: 'bg-gray-300',
};

function getTrafficColor(compliance: number) {
  if (compliance >= 80) return TRAFFIC_COLORS.green;
  if (compliance >= 50) return TRAFFIC_COLORS.yellow;
  if (compliance >= 0) return TRAFFIC_COLORS.red;
  return TRAFFIC_COLORS.gray;
}

export function ClientList() {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const pageSize = 25;

  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      getPaginatedClientsWithCompliance(user.uid, pageSize, page > 1 ? lastDoc : null)
        .then(({ clients, lastDoc }) => {
          setClients(clients);
          setLastDoc(lastDoc);
          setHasNext(!!lastDoc);
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, page]);

  if (loading) return <div className="py-6 text-center text-muted-foreground">Loading clients...</div>;
  if (!clients.length) return <div className="py-6 text-center text-muted-foreground">No clients found.</div>;

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow mt-8">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Clients</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left font-semibold">Photo</th>
                <th className="p-2 text-left font-semibold">Name</th>
                <th className="p-2 text-left font-semibold">Email</th>
                <th className="p-2 text-left font-semibold">Phone</th>
                <th className="p-2 text-left font-semibold">Compliance %</th>
                <th className="p-2 text-left font-semibold">Last 5 Check-ins</th>
                <th className="p-2 text-left font-semibold">View</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b last:border-b-0 hover:bg-muted/30 transition">
                  <td className="p-2">
                    {client.photoUrl ? (
                      <img src={client.photoUrl} alt={client.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        {client.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </td>
                  <td className="p-2 font-medium">{client.name}</td>
                  <td className="p-2">{client.email}</td>
                  <td className="p-2">{client.phone || '-'}</td>
                  <td className="p-2 font-semibold">{client.compliance}%</td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      {client.last5Checkins.map((ci: any, idx: number) => {
                        const color = getTrafficColor(ci.compliance ?? 0);
                        return <span key={idx} className={`inline-block w-3 h-3 rounded-full ${color}`} title={`Compliance: ${ci.compliance ?? 0}%`} />;
                      })}
                    </div>
                  </td>
                  <td className="p-2">
                    <Link href={`/coach/clients/${client.id}`} className="text-blue-600 hover:underline font-semibold">View Client</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            className="flex items-center gap-1 px-3 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeftIcon className="w-4 h-4" /> Prev
          </button>
          <span className="text-xs">Page {page}</span>
          <button
            className="flex items-center gap-1 px-3 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
            onClick={() => setPage((p) => (hasNext ? p + 1 : p))}
            disabled={!hasNext}
          >
            Next <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 