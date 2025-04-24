import { SparklesIcon, HeartIcon, TrophyIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export interface CoachSummaryProps {
  coachName: string;
  weeklyHighlights: {
    wins: string[];
    clientQuotes: {
      quote: string;
      clientName: string;
    }[];
    impactMetrics: {
      label: string;
      value: string;
      trend: 'up' | 'down' | 'stable';
      change: number;
    }[];
  };
  encouragement: string;
}

export function CoachSummary({ coachName, weeklyHighlights, encouragement }: CoachSummaryProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <SparklesIcon className="h-6 w-6 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">
            Coach Impact Summary
          </h2>
        </div>

        {/* Encouragement Message */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900/50 p-4 rounded-lg border border-gray-700"
          >
            <p className="text-gray-300 italic">
              "{encouragement}"
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Wins */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrophyIcon className="h-5 w-5 text-yellow-400" />
              <h3 className="text-sm font-medium text-white">
                This Week's Wins
              </h3>
            </div>
            <ul className="space-y-2">
              {weeklyHighlights.wins.map((win, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-green-400 text-lg">•</span>
                  <span className="text-sm text-gray-300">{win}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Client Quotes */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-medium text-white">
                Client Appreciation
              </h3>
            </div>
            <div className="space-y-4">
              {weeklyHighlights.clientQuotes.map((quote, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/50 p-3 rounded-lg border border-gray-700"
                >
                  <p className="text-sm text-gray-300 italic mb-2">
                    "{quote.quote}"
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    - {quote.clientName}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <HeartIcon className="h-5 w-5 text-red-400" />
            <h3 className="text-sm font-medium text-white">
              Your Impact
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {weeklyHighlights.impactMetrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 p-3 rounded-lg border border-gray-700"
              >
                <p className="text-sm text-gray-400 mb-1">{metric.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold text-white">{metric.value}</span>
                  <span className={`text-xs font-medium ${
                    metric.trend === 'up' ? 'text-green-400' : 
                    metric.trend === 'down' ? 'text-red-400' : 
                    'text-gray-400'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 