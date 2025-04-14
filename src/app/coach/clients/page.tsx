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
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { getClients } from '@/lib/services/firebaseService';

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

interface ClientStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  recentCheckIns: number;
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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

  const calculateStats = (clients: Client[]): ClientStats => {
    return {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.isActive).length,
      inactiveClients: clients.filter(c => !c.isActive).length,
      recentCheckIns: clients.filter(c => {
        if (!c.lastCheckIn) return false;
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        return c.lastCheckIn > lastWeek;
      }).length
    };
  };

  const stats = calculateStats(clients);

  return (
    <div className="min-h-screen bg-[#13141A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-gray-400 mt-1">Manage and monitor your client relationships</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/coach/clients/invite"
              className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-white hover:bg-gray-800 transition-colors"
            >
              Invite Client
            </Link>
            <Link
              href="/coach/clients/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Add New Client
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Clients</p>
                <p className="text-2xl font-semibold">{stats.totalClients}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">Active Clients</p>
                <p className="text-2xl font-semibold">{stats.activeClients}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-400" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">Inactive Clients</p>
                <p className="text-2xl font-semibold">{stats.inactiveClients}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">Recent Check-ins</p>
                <p className="text-2xl font-semibold">{stats.recentCheckIns}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={sortField}
                    onChange={(e) => handleSort(e.target.value as keyof Client)}
                    className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="email">Sort by Email</option>
                    <option value="lastCheckIn">Sort by Last Check-in</option>
                    <option value="lastLoginAt">Sort by Last Login</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Client List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center">
                      <span>Name</span>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Last Check-in</th>
                  <th className="px-6 py-3 text-left">Last Login</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedClients.map((client) => (
                  <tr 
                    key={client.id} 
                    className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                            {client.avatar ? (
                              <img
                                src={client.avatar}
                                alt={client.name}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <span className="text-lg font-medium">
                                {client.name.charAt(0)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{client.name}</div>
                          {client.program && (
                            <div className="text-sm text-gray-400">{client.program}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{client.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          client.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {client.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {client.lastCheckIn ? (
                        <div className="flex items-center text-gray-400">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {client.lastCheckIn.toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-500">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client.lastLoginAt ? (
                        <div className="flex items-center text-gray-400">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {client.lastLoginAt.toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-500">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/coach/clients/${client.id}`}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          View Details
                        </Link>
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