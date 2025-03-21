'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  ClockIcon,
  BanknotesIcon,
  ArrowPathIcon,
  CreditCardIcon,
} from '@heroicons/react/24/solid';
import { getClients, getCoach, type Client, type Coach } from '@/lib/services/firebaseService';

interface ClientWithCoach extends Client {
  coach?: Coach | null;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithCoach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState({ field: 'name', direction: 'asc' });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const clientsData = await getClients();
      
      // Fetch coach data for each client
      const clientsWithCoaches = await Promise.all(
        clientsData.map(async (client) => {
          let coach = null;
          if (client.coachId) {
            try {
              coach = await getCoach(client.coachId);
            } catch (error) {
              console.error(`Error fetching coach for client ${client.id}:`, error);
            }
          }
          return {
            ...client,
            coach,
            goals: Array.isArray(client.goals) ? client.goals : []
          };
        })
      );

      setClients(clientsWithCoaches);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <ArrowPathIcon className="w-5 h-5 animate-spin" />
          Loading clients...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <Link 
            href="/admin/clients/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add New Client
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(16,24,40,0.08)] p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search clients..."
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={`${sortBy.field}-${sortBy.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortBy({ field, direction });
                }}
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(16,24,40,0.08)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Coach</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Goals</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <span className="text-slate-600 font-medium">
                              {client.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{client.name}</div>
                          <div className="text-sm text-slate-500">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.coach ? (
                        <div>
                          <div className="text-sm font-medium text-slate-900">{client.coach.name}</div>
                          <div className="text-sm text-slate-500">{client.coach.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {client.status || 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {client.goals.map((goal, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </Link>
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