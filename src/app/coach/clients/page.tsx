'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  UserGroupIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { getClients, getCheckIns, type Client, type CheckIn } from '@/lib/services/firebaseService';
import { DataTable } from '@/components/admin/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DashboardNav } from '@/components/DashboardNav';

interface ClientWithCheckIns extends Client {
  lastCheckIn?: CheckIn | null;
  progress?: number;
  status?: 'Active' | 'Inactive';
  joinDate?: string;
  lastActive?: string;
  weeklyProgress?: {
    workouts: number;
    nutrition: number;
    steps: number;
  };
}

export default function CoachClients() {
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<ClientWithCheckIns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState({ field: 'name', direction: 'asc' });

  useEffect(() => {
    const loadClients = async () => {
      if (authLoading) return;
      
      if (!user?.email) {
        setError('Please log in to view your clients');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Mock data for development
        const mockClients: ClientWithCheckIns[] = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john@example.com',
            coachId: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 75,
            status: 'Active',
            joinDate: '2024-01-15',
            lastActive: '2024-03-10',
            weeklyProgress: {
              workouts: 5,
              nutrition: 90,
              steps: 8500
            }
          },
          {
            id: '2',
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            coachId: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 85,
            status: 'Active',
            joinDate: '2024-02-01',
            lastActive: '2024-03-09',
            weeklyProgress: {
              workouts: 6,
              nutrition: 95,
              steps: 12000
            }
          },
          {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            coachId: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 30,
            status: 'Inactive',
            joinDate: '2024-02-15',
            lastActive: '2024-03-01',
            weeklyProgress: {
              workouts: 2,
              nutrition: 60,
              steps: 5000
            }
          }
        ];
        
        setClients(mockClients);
      } catch (err) {
        console.error('Error loading clients:', err);
        setError('Failed to load clients. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, [user?.email, authLoading]);

  // Filter and sort clients
  const filteredClients = clients
    .filter(client => {
      const matchesSearch = 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const direction = sortBy.direction === 'asc' ? 1 : -1;
      if (sortBy.field === 'name') {
        return a.name.localeCompare(b.name) * direction;
      }
      return 0;
    });

  // Calculate client stats
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const averageProgress = Math.round(
    clients.reduce((sum, client) => sum + (client.progress || 0), 0) / totalClients
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <DashboardNav />
      
      <main className="p-2 sm:p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage and monitor your client progress</p>
            </div>
            <Link 
              href="/coach/clients/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Client
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clients</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalClients}</h3>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Clients</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeClients}</h3>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Progress</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{averageProgress}%</h3>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Client Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                        <UserCircleIcon className="h-8 w-8" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{client.email}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === 'Active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Overall Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">{client.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Workouts</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {client.weeklyProgress?.workouts}/7
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Nutrition</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {client.weeklyProgress?.nutrition}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Steps</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {(client.weeklyProgress?.steps || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Last Active: {client.lastActive}</span>
                    <Link
                      href={`/coach/clients/${client.id}`}
                      className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {clients.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Clients Yet</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by adding your first client</p>
              <Link 
                href="/coach/clients/new"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Your First Client
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 