import { useEffect, useState } from 'react';
import { getClientOfTheWeek } from '@/lib/firebase/coachAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { StarIcon, UserCircleIcon } from '@heroicons/react/24/solid';

export function ClientOfTheWeek() {
  const { user } = useAuth();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      getClientOfTheWeek(user.uid)
        .then(setClient)
        .finally(() => setLoading(false));
    }
  }, [user?.uid]);

  if (loading) return <div className="py-4 text-center text-muted-foreground">Loading client of the week...</div>;
  if (!client) return <div className="py-4 text-center text-muted-foreground">No client of the week found.</div>;

  return (
    <div className="rounded-xl shadow bg-gradient-to-br from-blue-500 to-purple-600 text-white h-full">
      <div className="p-6 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
          <StarIcon className="w-7 h-7 text-yellow-300" />
          <span className="text-lg font-bold tracking-wide">Client of the Week</span>
        </div>
        {client.avatar ? (
          <img
            src={client.avatar}
            alt={client.name}
            className="w-20 h-20 rounded-full border-4 border-yellow-300 shadow-lg mb-2"
          />
        ) : (
          <UserCircleIcon className="w-20 h-20 text-white/70 mb-2" />
        )}
        <div className="text-xl font-semibold mb-1">{client.name || client.fullName}</div>
        <div className="text-sm opacity-80 mb-2">Top performer this week!</div>
        {/* Example stats, adjust as needed */}
        <div className="flex gap-4 mt-2">
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{client.workoutsCompleted ?? '-'}</span>
            <span className="text-xs opacity-80">Workouts</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{client.nutritionScore ?? '-'}</span>
            <span className="text-xs opacity-80">Nutrition</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{client.steps ?? '-'}</span>
            <span className="text-xs opacity-80">Steps</span>
          </div>
        </div>
      </div>
    </div>
  );
} 