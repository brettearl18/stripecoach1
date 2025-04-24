import { motion } from 'framer-motion';
import {
  TrophyIcon,
  HeartIcon,
  ClipboardDocumentCheckIcon,
  ArrowTrendingUpIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface RecentBadgeWinsProps {
  className?: string;
}

export function RecentBadgeWins({ className = '' }: RecentBadgeWinsProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrophyIcon className="h-6 w-6 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Badge Wins
            </h2>
          </div>
          <Link
            href="/badges"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
          >
            Manage Badges
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {/* Consistency Champion */}
          <div className="bg-red-50/50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100/50 dark:border-red-800/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-red-100 dark:bg-red-800/30 rounded-full">
                  <ClipboardDocumentCheckIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Consistency Champion
                  </h3>
                  <span className="text-xs text-gray-600 dark:text-gray-400">21/04/2024</span>
                </div>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  Completed 30 days of consecutive check-ins
                </p>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Sarah Wilson · streak
                </p>
              </div>
            </div>
          </div>

          {/* Strength Milestone */}
          <div className="bg-yellow-50/50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100/50 dark:border-yellow-800/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-800/30 rounded-full">
                  <TrophyIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Strength Milestone
                  </h3>
                  <span className="text-xs text-gray-600 dark:text-gray-400">20/04/2024</span>
                </div>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  Achieved 100kg deadlift personal record
                </p>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  James Thompson · milestone
                </p>
              </div>
            </div>
          </div>

          {/* Nutrition Master */}
          <div className="bg-green-50/50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100/50 dark:border-green-800/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-full">
                  <HeartIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Nutrition Master
                  </h3>
                  <span className="text-xs text-gray-600 dark:text-gray-400">19/04/2024</span>
                </div>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  Maintained perfect macro compliance for 2 weeks
                </p>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Emma Davis · achievement
                </p>
              </div>
            </div>
          </div>

          {/* Rapid Progress */}
          <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100/50 dark:border-blue-800/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-full">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Rapid Progress
                  </h3>
                  <span className="text-xs text-gray-600 dark:text-gray-400">18/04/2024</span>
                </div>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  Lost 5% body fat in 8 weeks
                </p>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Michael Chen · improvement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 