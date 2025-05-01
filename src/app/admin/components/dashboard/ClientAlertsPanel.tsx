import { useEffect, useState } from 'react';
import { getClientAlerts } from '@/lib/services/adminDashboardService';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Alert {
  id: string;
  clientName: string;
  issue: string;
  coachName: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'info';
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const alertTypeConfig = {
  error: {
    icon: XCircleIcon,
    iconClass: 'text-red-400',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    iconClass: 'text-yellow-400',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-700',
  },
  info: {
    icon: InformationCircleIcon,
    iconClass: 'text-blue-400',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
  },
};

export default function ClientAlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const data = await getClientAlerts();
        setAlerts(data);
      } catch (err) {
        setError('Failed to load client alerts');
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Recent Alerts
        </h2>
        <div className="mt-6 flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {alerts.map((alert) => {
              const config = alertTypeConfig[alert.type];
              const AlertIcon = config.icon;

              return (
                <li key={alert.id} className="py-5">
                  <div className={classNames(
                    config.bgClass,
                    'rounded-lg p-4'
                  )}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertIcon
                          className={classNames(
                            config.iconClass,
                            'h-5 w-5'
                          )}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className={classNames(
                          config.textClass,
                          'text-sm font-medium'
                        )}>
                          {alert.issue}
                        </h3>
                        <div className="mt-2 text-sm">
                          <div className="flex justify-between">
                            <div>
                              <Link
                                href={`/admin/clients/${alert.clientName}`}
                                className="font-medium text-indigo-600 hover:text-indigo-900"
                              >
                                {alert.clientName}
                              </Link>
                              <span className="text-gray-500"> • </span>
                              <Link
                                href={`/admin/coaches/${alert.coachName}`}
                                className="text-gray-500 hover:text-gray-900"
                              >
                                {alert.coachName}
                              </Link>
                            </div>
                            <time
                              dateTime={alert.timestamp.toISOString()}
                              className="text-gray-500"
                            >
                              {new Intl.DateTimeFormat('en-US', {
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true,
                              }).format(alert.timestamp)}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {alerts.length > 0 && (
            <div className="mt-6">
              <Link
                href="/admin/alerts"
                className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                View all alerts
              </Link>
            </div>
          )}
          {alerts.length === 0 && (
            <div className="text-center py-8">
              <InformationCircleIcon
                className="mx-auto h-12 w-12 text-gray-400"
                aria-hidden="true"
              />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No alerts
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no active alerts at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 