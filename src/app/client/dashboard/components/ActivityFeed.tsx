'use client';

import {
  CheckCircleIcon,
  TrophyIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  title: string;
  details: string;
  time: string;
  icon: string;
  color: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'workout':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'achievement':
        return <TrophyIcon className="w-5 h-5" />;
      case 'message':
        return <ChatBubbleLeftIcon className="w-5 h-5" />;
      default:
        return <CheckCircleIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <div className={`p-2 rounded-full ${activity.color.replace('text', 'bg')}/10`}>
            {getIcon(activity.icon)}
          </div>
          <div>
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-xs text-gray-400">{activity.details}</p>
            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 