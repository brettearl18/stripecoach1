import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType?: 'increase' | 'decrease';
  icon?: ReactNode;
  trend?: number[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function MetricCard({
  title,
  value,
  change,
  changeType,
  icon,
  trend
}: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
      <dt>
        {icon && (
          <div className="absolute rounded-md bg-indigo-500 p-3">
            {icon}
          </div>
        )}
        <p className={classNames(
          icon ? "ml-16" : "",
          "truncate text-sm font-medium text-gray-500"
        )}>
          {title}
        </p>
      </dt>
      <dd className={classNames(
        icon ? "ml-16" : "",
        "mt-1 flex items-baseline pb-6"
      )}>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p
          className={classNames(
            changeType === 'increase'
              ? 'text-green-600'
              : changeType === 'decrease'
              ? 'text-red-600'
              : 'text-gray-600',
            'ml-2 flex items-baseline text-sm font-semibold'
          )}
        >
          {changeType && (
            changeType === 'increase' ? (
              <ArrowUpIcon
                className="h-5 w-5 flex-shrink-0 self-center text-green-500"
                aria-hidden="true"
              />
            ) : (
              <ArrowDownIcon
                className="h-5 w-5 flex-shrink-0 self-center text-red-500"
                aria-hidden="true"
              />
            )
          )}
          <span className="sr-only">
            {changeType === 'increase' ? 'Increased' : 'Decreased'} by
          </span>
          {change}
        </p>
      </dd>
      {trend && trend.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              {trend.map((value, i) => (
                <div
                  key={i}
                  className="h-8 w-2 rounded-full bg-indigo-200"
                  style={{
                    height: `${(value / Math.max(...trend)) * 32}px`,
                    backgroundColor: i === trend.length - 1 ? '#6366f1' : undefined
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 