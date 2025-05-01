'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getCoach, 
  getClientsByCoach,
  type Coach,
  type Client
} from '@/lib/services/firebaseService';
import { 
  ArrowLeftIcon,
  UserCircleIcon,
  ChartBarIcon,
  ScaleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { LastLoginBadge } from '@/components/ui/LastLoginBadge';

interface ClientWithStats extends Client {
  stats: {
    completionRate: number;
    checkInsCompleted: number;
    weightChange: number;
    daysInProgram: number;
  };
}

export default function CoachClients({ params }: { params: { coachId: string } }) {
  const router = useRouter();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadCoachAndClients();
  }, [params.coachId]);

  const loadCoachAndClients = async () => {
    try {
      setIsLoading(true);
      const coachData = await getCoach(params.coachId);
      setCoach(coachData);

      const clientsData = await getClientsByCoach(params.coachId);
      const clientsWithStats = clientsData.map(client => ({
        ...client,
        stats: {
          completionRate: Math.floor(Math.random() * 30) + 70, // 70-100%
          checkInsCompleted: Math.floor(Math.random() * 10) + 5, // 5-15 check-ins
          weightChange: (Math.random() * 10 - 5).toFixed(1), // -5 to +5 kg
          daysInProgram: Math.floor(Math.random() * 90) + 30, // 30-120 days
        }
      }));
      setClients(clientsWithStats);
    } catch (error) {
      console.error('Error loading coach and clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowsUpDownIcon className="w-4 h-4 text-gray-500" />;
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4 text-blue-400" /> : 
      <ChevronDownIcon className="w-4 h-4 text-blue-400" />;
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = sortField.split('.').reduce((obj, key) => obj[key], a);
    const bValue = sortField.split('.').reduce((obj, key) => obj[key], b);
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F15] to-[#1A1F2B] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading clients...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F15] to-[#1A1F2B] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Coaches
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                {coach?.name}'s Clients
              </h1>
              <p className="text-gray-400 text-lg">Manage and monitor client progress</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push(`/admin/coaches/${params.coachId}/messages`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#2A303C]/50 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
              >
                Message Coach
              </button>
              <button
                onClick={() => router.push(`/admin/coaches/${params.coachId}/edit`)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-lg shadow-blue-500/20"
              >
                Edit Coach Profile
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2A303C]/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#2A303C]/50 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors">
            <FunnelIcon className="h-5 w-5" />
            Filters
          </button>
        </div>

        {/* Clients Table */}
        <div className="bg-[#1A1F2B]/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/50 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#2A303C]/50">
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">
                    <button 
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Client
                      <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">
                    <button 
                      onClick={() => handleSort('stats.completionRate')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Completion Rate
                      <SortIcon field="stats.completionRate" />
                    </button>
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">
                    <button 
                      onClick={() => handleSort('stats.checkInsCompleted')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Check-ins
                      <SortIcon field="stats.checkInsCompleted" />
                    </button>
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">
                    <button 
                      onClick={() => handleSort('stats.weightChange')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Progress
                      <SortIcon field="stats.weightChange" />
                    </button>
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">
                    <button 
                      onClick={() => handleSort('stats.daysInProgram')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Time in Program
                      <SortIcon field="stats.daysInProgram" />
                    </button>
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">Last Active</th>
                  <th className="px-6 py-5 text-right text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {sortedClients.map((client) => (
                  <tr key={client.id} className="group hover:bg-[#2A303C]/30 transition-colors duration-200">
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <UserCircleIcon className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-100">{client.name}</div>
                          <div className="text-sm text-gray-400">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-700/50 rounded-full h-2.5 mr-3 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              client.stats.completionRate >= 90
                                ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                : client.stats.completionRate >= 70
                                ? 'bg-gradient-to-r from-yellow-500 to-green-500'
                                : 'bg-gradient-to-r from-red-500 to-yellow-500'
                            }`}
                            style={{ width: `${client.stats.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{client.stats.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5 text-purple-400" />
                        <span>{client.stats.checkInsCompleted} completed</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <ScaleIcon className="h-5 w-5 text-blue-400" />
                        <span className={client.stats.weightChange > 0 ? 'text-green-400' : 'text-red-400'}>
                          {client.stats.weightChange > 0 ? '+' : ''}{client.stats.weightChange} kg
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-yellow-400" />
                        <span>{client.stats.daysInProgram} days</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <LastLoginBadge lastLoginAt={client.lastLoginAt} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/admin/clients/${client.id}`)}
                          className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
                          title="View Profile"
                        >
                          <UserCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/clients/${client.id}/edit`)}
                          className="p-2 hover:bg-yellow-500/10 rounded-lg transition-colors text-yellow-400 hover:text-yellow-300"
                          title="Edit Client"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {/* Handle delete */}}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
                          title="Remove Client"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
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
  );
} 