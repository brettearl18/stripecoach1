import { SparklesIcon, HeartIcon, TrophyIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface CoachSummaryProps {
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

const mockData: CoachSummaryProps = {
  coachName: "Michael",
  weeklyHighlights: {
    wins: [
      "12 clients hit new personal records",
      "85% average check-in completion rate",
      "Helped 3 clients overcome plateaus"
    ],
    clientQuotes: [
      {
        quote: "Your guidance has been transformative. I never thought I could achieve this much!",
        clientName: "Sarah W."
      },
      {
        quote: "The way you break down complex nutrition concepts makes it so much easier to follow through.",
        clientName: "James T."
      }
    ],
    impactMetrics: [
      {
        label: "Client Satisfaction",
        value: "94%",
        trend: "up",
        change: 5
      },
      {
        label: "Goal Achievement Rate",
        value: "88%",
        trend: "up",
        change: 3
      }
    ]
  },
  encouragement: "Your dedication to your clients' success is making a real difference. Keep fostering those transformative moments and celebrating the small wins - they're the building blocks of lasting change."
};

export function CoachSummary() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <SparklesIcon className="h-6 w-6 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Coach Impact Summary
          </h2>
        </div>

        {/* Encouragement Message */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg"
          >
            <p className="text-gray-800 dark:text-gray-200 italic">
              "{mockData.encouragement}"
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Wins */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrophyIcon className="h-5 w-5 text-yellow-500" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                This Week's Wins
              </h3>
            </div>
            <ul className="space-y-3">
              {mockData.weeklyHighlights.wins.map((win, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-green-500 text-lg">•</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{win}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Client Quotes */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Client Appreciation
              </h3>
            </div>
            <div className="space-y-4">
              {mockData.weeklyHighlights.clientQuotes.map((quote, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-2">
                    "{quote.quote}"
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    - {quote.clientName}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <HeartIcon className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Your Impact
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {mockData.weeklyHighlights.impactMetrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {metric.label}
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {metric.value}
                  </span>
                  <span className={`text-sm ${
                    metric.trend === 'up' 
                      ? 'text-green-500' 
                      : metric.trend === 'down' 
                      ? 'text-red-500' 
                      : 'text-gray-500'
                  }`}>
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} 
                    {metric.change}%
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