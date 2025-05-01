import { formatDistanceToNow } from 'date-fns';
import { ClockIcon } from '@heroicons/react/24/outline';
import { Timestamp } from 'firebase/firestore';

interface LastLoginBadgeProps {
  lastLoginAt: Timestamp | Date | null | undefined;
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

  let date: Date;
  if (lastLoginAt instanceof Timestamp) {
    date = lastLoginAt.toDate();
  } else if (lastLoginAt instanceof Date) {
    date = lastLoginAt;
  } else {
    return (
      <span className={`inline-flex items-center text-sm text-gray-500 ${className}`}>
        <ClockIcon className="h-4 w-4 mr-1" />
        Invalid date
      </span>
    );
  }

  const timeAgo = formatDistanceToNow(date, { addSuffix: true });
  
  return (
    <span className={`inline-flex items-center text-sm text-gray-500 ${className}`}>
      <ClockIcon className="h-4 w-4 mr-1" />
      Last login {timeAgo}
    </span>
  );
} 