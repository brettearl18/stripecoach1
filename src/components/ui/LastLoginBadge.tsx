import { formatDistanceToNow } from 'date-fns';
import { ClockIcon } from '@heroicons/react/24/outline';

interface LastLoginBadgeProps {
  lastLoginAt: Date | null;
  className?: string;
}

export function LastLoginBadge({ lastLoginAt, className = '' }: LastLoginBadgeProps) {
  if (!lastLoginAt) {
    return (
      <span className={`inline-flex items-center text-sm text-gray-500 ${className}`}>
        <ClockIcon className="h-4 w-4 mr-1" />
        Never logged in
      </span>
    );
  }

  const timeAgo = formatDistanceToNow(lastLoginAt, { addSuffix: true });
  
  return (
    <span className={`inline-flex items-center text-sm text-gray-500 ${className}`}>
      <ClockIcon className="h-4 w-4 mr-1" />
      Last login {timeAgo}
    </span>
  );
} 