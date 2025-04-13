'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  FunnelIcon
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

  return (
    <div className="min-h-screen bg-[#13141A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Clients</h1>
          <Link
            href="/coach/clients/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add New Client
          </Link>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th 
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      <span>Name</span>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      <span>Email</span>
                      {sortField === 'email' && (
                        sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">Goals</th>
                  <th 
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => handleSort('lastLoginAt')}
                  >
                    <div className="flex items-center">
                      <span>Last Login</span>
                      {sortField === 'lastLoginAt' && (
                        sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => handleSort('isActive')}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {sortField === 'isActive' && (
                        sortDirection === 'asc' ? 
                        <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">Last Check-in</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : sortedClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                      No clients found
                    </td>
                  </tr>
                ) : (
                  sortedClients.map((client) => (
                    <tr 
                      key={client.id}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">{client.name}</td>
                      <td className="px-6 py-4">{client.email}</td>
                      <td className="px-6 py-4">
                        {client.goals?.map((goal, index) => (
                          <span key={index} className="inline-block bg-gray-700 rounded-full px-2 py-1 text-xs mr-1 mb-1">
                            {goal}
                          </span>
                        )) || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {client.lastLoginAt?.toLocaleDateString() || 'Never'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {client.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {client.lastCheckIn?.toLocaleDateString() || 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/coach/clients/${client.id}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View Details
                        </Link>
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