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
} from '@heroicons/react/24/outline';
import { getClients, getCheckIns, type Client, type CheckIn } from '@/lib/services/firebaseService';
import { DataTable } from '@/components/admin/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ClientWithCheckIns extends Client {
  lastCheckIn?: CheckIn | null;
  progress?: number;
  status?: 'Active' | 'Inactive';
  joinDate?: string;
  lastActive?: string;
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
            lastActive: '2024-03-10'
          },
          {
            id: '2',
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            coachId: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 45,
            status: 'Active',
            joinDate: '2024-02-01',
            lastActive: '2024-03-09'
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
            lastActive: '2024-03-01'
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

  const columns = [
    {
      header: 'Client',
      key: 'name',
      render: (name, client) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
            <UserCircleIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="font-medium text-white">{name}</div>
            <div className="text-sm text-gray-400">{client.email}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Join Date', 
      key: 'joinDate',
      render: (date) => (
        <span className="text-gray-300">{date}</span>
      )
    },
    { 
      header: 'Last Active', 
      key: 'lastActive',
      render: (date) => (
        <span className="text-gray-300">{date}</span>
      )
    },
    {
      header: 'Progress',
      key: 'progress',
      render: (progress) => (
        <div className="flex items-center">
          <div className="w-24 h-2 bg-gray-700 rounded-full mr-2">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-400">{progress}%</span>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === 'Active'
              ? 'bg-green-500/10 text-green-500'
              : 'bg-red-500/10 text-red-500'
          }`}
        >
          {status}
        </span>
      )
    }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="min-h-screen bg-[#13141A] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Clients</h1>
              <p className="text-gray-400">Monitor and manage your client base</p>
            </div>
            <Link 
              href="/coach/clients/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Client
            </Link>
          </div>
          
          <div className="bg-[#1a1b1e] rounded-lg p-8 text-center">
            <UserGroupIcon className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Clients Yet</h2>
            <p className="text-gray-400 mb-6">Get started by adding your first client</p>
            <Link 
              href="/coach/clients/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Your First Client
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13141A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Clients</h1>
            <p className="text-gray-400">Monitor and manage your client base</p>
          </div>
          <Link 
            href="/coach/clients/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Client
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Clients</p>
                <h3 className="text-2xl font-bold text-white mt-1">{clients.length}</h3>
                <p className="text-green-500 text-sm mt-1">Active clients</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Progress</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {Math.round(clients.reduce((acc, client) => acc + (client.progress || 0), 0) / clients.length)}%
                </h3>
                <p className="text-green-500 text-sm mt-1">+5% from last month</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Today</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {clients.filter(c => c.status === 'Active').length}
                </h3>
                <p className="text-yellow-500 text-sm mt-1">
                  {Math.round((clients.filter(c => c.status === 'Active').length / clients.length) * 100)}% of total
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1b1e] rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search clients..."
                className="px-4 py-2 rounded-lg bg-[#13141A] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="px-4 py-2 rounded-lg bg-[#13141A] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredClients}
            actions={(client) => (
              <div className="flex space-x-2">
                <Link
                  href={`/coach/clients/${client.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                >
                  View Profile
                </Link>
                <Link
                  href={`/coach/clients/${client.id}/progress`}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
                >
                  Progress Report
                </Link>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
} 