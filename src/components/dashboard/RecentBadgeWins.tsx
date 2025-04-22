import { motion } from 'framer-motion';
import {
  StarIcon,
  FireIcon,
  TrophyIcon,
  SparklesIcon,
  HeartIcon,
  BoltIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: 'star' | 'fire' | 'trophy' | 'sparkles' | 'heart' | 'bolt' | 'chart';
  color: string;
  achievedAt: string;
  clientName: string;
  clientId: string;
  type: 'milestone' | 'streak' | 'achievement' | 'improvement';
}

const iconMap = {
  star: StarIcon,
  fire: FireIcon,
  trophy: TrophyIcon,
  sparkles: SparklesIcon,
  heart: HeartIcon,
  bolt: BoltIcon,
  chart: ChartBarIcon,
};

const colorMap = {
  red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
};

// Mock data - replace with real data from your backend
const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'Consistency Champion',
    description: 'Completed 30 days of consecutive check-ins',
    icon: 'fire',
    color: 'red',
    achievedAt: '2024-04-21',
    clientName: 'Sarah Wilson',
    clientId: 'client-1',
    type: 'streak'
  },
  {
    id: '2',
    name: 'Strength Milestone',
    description: 'Achieved 100kg deadlift personal record',
    icon: 'trophy',
    color: 'yellow',
    achievedAt: '2024-04-20',
    clientName: 'James Thompson',
    clientId: 'client-2',
    type: 'milestone'
  },
  {
    id: '3',
    name: 'Nutrition Master',
    description: 'Maintained perfect macro compliance for 2 weeks',
    icon: 'star',
    color: 'green',
    achievedAt: '2024-04-19',
    clientName: 'Emma Davis',
    clientId: 'client-3',
    type: 'achievement'
  },
  {
    id: '4',
    name: 'Rapid Progress',
    description: 'Lost 5% body fat in 8 weeks',
    icon: 'bolt',
    color: 'blue',
    achievedAt: '2024-04-18',
    clientName: 'Michael Chen',
    clientId: 'client-4',
    type: 'improvement'
  }
];

interface RecentBadgeWinsProps {
  className?: string;
}

export function RecentBadgeWins({ className = '' }: RecentBadgeWinsProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-6 w-6 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Badge Wins
            </h2>
          </div>
          <Link
            href="/coach/settings/badges"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
          >
            Manage Badges →
          </Link>
        </div>

        <div className="space-y-4">
          {mockBadges.map((badge, index) => {
            const Icon = iconMap[badge.icon];
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${colorMap[badge.color]} rounded-lg p-4`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg bg-white dark:bg-gray-700`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {badge.name}
                      </p>
                      <span className="text-xs opacity-75">
                        {new Date(badge.achievedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm opacity-90">
                      {badge.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Link
                        href={`/coach/clients/${badge.clientId}`}
                        className="text-xs font-medium hover:opacity-75"
                      >
                        {badge.clientName}
                      </Link>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                        {badge.type}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 