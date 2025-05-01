import { useEffect, useState } from 'react';
import { getCoachPerformance, CoachPerformance } from '@/lib/services/adminDashboardService';
import Image from 'next/image';
import Link from 'next/link';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function CoachPerformanceTable() {
  const [coaches, setCoaches] = useState<CoachPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoachPerformance() {
      try {
        const data = await getCoachPerformance();
        setCoaches(data);
      } catch (err) {
        setError('Failed to load coach performance data');
        console.error('Error fetching coach performance:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCoachPerformance();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
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
          Coach Performance
        </h2>
        <div className="mt-4 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Coach
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Active Clients
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Completion Rate
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Response Time
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Client Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coaches.map((coach) => (
                    <tr key={coach.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="relative h-10 w-10 rounded-full bg-gray-100">
                              <span className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm font-medium uppercase">
                                {coach.name[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Link
                              href={`/admin/coaches/${coach.id}`}
                              className="font-medium text-indigo-600 hover:text-indigo-900"
                            >
                              {coach.name}
                            </Link>
                            <div className="text-gray-500">{coach.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="text-gray-900">{coach.clients.active}</div>
                        <div className="text-gray-500">of {coach.clients.total}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div
                          className={classNames(
                            coach.completionRate >= 90
                              ? 'text-green-600'
                              : coach.completionRate >= 75
                              ? 'text-yellow-600'
                              : 'text-red-600',
                            'font-medium'
                          )}
                        >
                          {coach.completionRate}%
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div
                          className={classNames(
                            coach.responseTime <= 12
                              ? 'text-green-600'
                              : coach.responseTime <= 24
                              ? 'text-yellow-600'
                              : 'text-red-600',
                            'font-medium'
                          )}
                        >
                          {coach.responseTime}h
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex gap-1">
                          {coach.progress.success > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                              <span className="text-gray-900">
                                {coach.progress.success}
                              </span>
                            </div>
                          )}
                          {coach.progress.neutral > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                              <span className="text-gray-900">
                                {coach.progress.neutral}
                              </span>
                            </div>
                          )}
                          {coach.progress.warning > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                              <span className="text-gray-900">
                                {coach.progress.warning}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 