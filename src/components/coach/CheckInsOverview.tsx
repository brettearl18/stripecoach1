import { useState } from 'react';
import Link from 'next/link';
import {
  BellIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

export interface CheckInResponse {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  status: 'pending' | 'overdue' | 'completed';
  aiSummary?: string;
}

interface CheckInsOverviewProps {
  checkIns: CheckInResponse[];
}

export function CheckInsOverview({ checkIns }: CheckInsOverviewProps) {
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredCheckIns = checkIns.filter(checkIn => {
    if (!search) return true;
    return checkIn.clientName.toLowerCase().includes(search.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400';
    }
  };

  const handleNudge = (clientId: string) => {
    // TODO: Implement push notification functionality
    console.log('Sending reminder to client:', clientId);
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Weekly Check-ins</h2>
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Client Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Last Check-in
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCheckIns.map((checkIn) => (
              <>
                <tr 
                  key={checkIn.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  onClick={() => toggleRow(checkIn.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {expandedRow === checkIn.id ? 
                        <ChevronUpIcon className="h-4 w-4 mr-2 text-gray-400" /> : 
                        <ChevronDownIcon className="h-4 w-4 mr-2 text-gray-400" />
                      }
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {checkIn.clientName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(checkIn.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(checkIn.status)}`}>
                      {checkIn.status.charAt(0).toUpperCase() + checkIn.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {checkIn.status === 'completed' ? (
                      <Link 
                        href={`/coach/clients/${checkIn.clientId}?checkIn=${checkIn.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EyeIcon className="h-5 w-5 inline-block" />
                      </Link>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNudge(checkIn.clientId);
                        }}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Send reminder"
                      >
                        <BellIcon className="h-5 w-5 inline-block" />
                      </button>
                    )}
                  </td>
                </tr>
                {expandedRow === checkIn.id && checkIn.aiSummary && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <div className="font-medium mb-2">AI Summary:</div>
                        <p className="whitespace-pre-wrap">{checkIn.aiSummary}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 