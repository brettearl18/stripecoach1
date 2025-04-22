'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  FunnelIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { getClients } from '@/lib/services/firebaseService';
import { SCORING_TIERS } from '@/app/coach/templates-v2/services/scoringService';

interface Client {
  id?: string;
  name: string;
  email: string;
  coachId: string;
  goals: string[];
  avatar?: string;
  program?: string;
  lastLoginAt?: Date;
  lastCheckIn?: Date;
  isActive: boolean;
}

export default function ClientsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Client>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const loadClients = async () => {
      if (!user) return;
      
      try {
        const fetchedClients = await getClients(user.uid);
        // Convert Timestamps to Dates
        const clientsWithDates = fetchedClients.map(client => ({
          ...client,
          lastLoginAt: client.lastLoginAt?.toDate(),
          lastCheckIn: client.lastCheckIn?.toDate()
        }));
        setClients(clientsWithDates);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadClients();
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#13141A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#13141A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Please log in to view your clients</p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const handleSort = (field: keyof Client) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredClients = clients.filter(client => {
    const nameMatch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'all' ? true :
                       statusFilter === 'active' ? client.isActive :
                       statusFilter === 'inactive' ? !client.isActive : true;
    
    return nameMatch && statusMatch;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    const aValue = sortField === 'name' ? a.name :
                  sortField === 'email' ? a.email :
                  sortField === 'status' ? (a.isActive ? 'Active' : 'Inactive') :
                  sortField === 'goals' ? (a.goals?.length || 0) : '';
                  
    const bValue = sortField === 'name' ? b.name :
                  sortField === 'email' ? b.email :
                  sortField === 'status' ? (b.isActive ? 'Active' : 'Inactive') :
                  sortField === 'goals' ? (b.goals?.length || 0) : '';

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const comparison = String(aValue).localeCompare(String(bValue));
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Calculate client statistics
  const clientStats = {
    total: clients.length,
    active: clients.filter(c => c.isActive).length,
    atRisk: clients.filter(c => {
      const status = getComplianceStatus(c);
      return status === 'red' && c.isActive;
    }).length,
    needsAttention: clients.filter(c => {
      const status = getComplianceStatus(c);
      return status === 'orange' && c.isActive;
    }).length,
    recentCheckIns: clients.filter(c => {
      const lastCheckIn = c.lastCheckIn;
      if (!lastCheckIn) return false;
      const daysSinceCheckIn = Math.floor((new Date().getTime() - lastCheckIn.getTime()) / (1000 * 3600 * 24));
      return daysSinceCheckIn <= 2;
    }).length
  };

  // Quick filter options
  const quickFilters = [
    { label: 'All Clients', value: 'all', count: clientStats.total },
    { label: 'Active', value: 'active', count: clientStats.active },
    { label: 'At Risk', value: 'at-risk', count: clientStats.atRisk },
    { label: 'Needs Attention', value: 'needs-attention', count: clientStats.needsAttention }
  ];

  return (
    <div className="min-h-screen bg-[#13141A] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-gray-400 mt-1">Manage and monitor your client progress</p>
          </div>
          <Link
            href="/coach/clients/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add New Client
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Clients</p>
                  <p className="text-2xl font-semibold">{clientStats.total}</p>
                </div>
              </div>
              <div className="text-sm text-blue-400">
                {Math.round((clientStats.active / clientStats.total) * 100)}% Active
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Recent Check-ins</p>
                  <p className="text-2xl font-semibold">{clientStats.recentCheckIns}</p>
                </div>
              </div>
              <div className="text-sm text-green-400">Last 48h</div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Needs Attention</p>
                  <p className="text-2xl font-semibold">{clientStats.needsAttention}</p>
                </div>
              </div>
              <div className="text-sm text-orange-400">
                {Math.round((clientStats.needsAttention / clientStats.total) * 100)}%
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">At Risk</p>
                  <p className="text-2xl font-semibold">{clientStats.atRisk}</p>
                </div>
              </div>
              <div className="text-sm text-red-400">
                Immediate Action
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filters and Search */}
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex flex-col space-y-4">
              {/* Quick Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {quickFilters.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      statusFilter === filter.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filter.label}
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-800 text-xs">
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search and Advanced Filters */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or goals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as keyof Client)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="lastCheckIn">Sort by Check-in</option>
                  <option value="complianceScore">Sort by Compliance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Client List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Compliance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Goals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : sortedClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="text-gray-400">
                        <p className="text-lg">No clients found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedClients.map((client) => (
                    <tr 
                      key={client.id}
                      className="hover:bg-gray-800/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                              {client.avatar ? (
                                <img
                                  src={client.avatar}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-xl font-medium">
                                  {client.name.charAt(0)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-gray-400">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ComplianceIndicator status={getComplianceStatus(client)} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {client.goals?.slice(0, 2).map((goal, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-700"
                            >
                              {goal}
                            </span>
                          ))}
                          {(client.goals?.length || 0) > 2 && (
                            <span className="text-xs text-gray-400 px-2 py-1">
                              +{client.goals!.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-400">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {client.lastCheckIn?.toLocaleDateString() || 'Never'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          client.isActive 
                            ? 'bg-green-500/10 text-green-400' 
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {client.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/coach/clients/${client.id}`}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                          >
                            View Profile
                          </Link>
                          <Link
                            href={`/coach/clients/${client.id}/check-ins`}
                            className="text-sm text-gray-400 hover:text-gray-300 font-medium"
                          >
                            Check-ins
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 