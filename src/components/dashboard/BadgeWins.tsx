import { useEffect, useState } from 'react';
import { getRecentBadgeWins } from '@/lib/firebase/coachAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { TrophyIcon } from '@heroicons/react/24/outline';

export function BadgeWins() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      getRecentBadgeWins(user.uid)
        .then(setBadges)
        .finally(() => setLoading(false));
    }
  }, [user?.uid]);

  if (loading) return <div className="py-4 text-center text-muted-foreground">Loading badge wins...</div>;
  if (!badges.length) return <div className="py-4 text-center text-muted-foreground">No recent badge wins.</div>;

  const badgeColors = [
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-green-100 text-green-800',
    'bg-blue-100 text-blue-800',
    'bg-pink-100 text-pink-800',
    'bg-orange-100 text-orange-800',
  ];

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow h-full">
      <div className="p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <TrophyIcon className="w-5 h-5 text-yellow-500" />
          Recent Badge Wins
        </h3>
        <ul className="flex flex-col gap-4">
          {badges.map((badge, idx) => (
            <li
              key={badge.id}
              className={`flex items-center gap-4 p-4 rounded-lg shadow-sm ${badgeColors[idx % badgeColors.length]} animate-fade-in`}
            >
              <TrophyIcon className="w-8 h-8 text-yellow-500 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-base">{badge.title || badge.name}</div>
                <div className="text-sm opacity-80">{badge.description}</div>
                <div className="text-xs mt-1 opacity-60">
                  {badge.clientName} &middot; {badge.date ? new Date(badge.date.seconds ? badge.date.seconds * 1000 : badge.date).toLocaleDateString() : ''}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 