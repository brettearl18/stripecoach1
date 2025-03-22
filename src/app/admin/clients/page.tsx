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
  UserCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { getClients, getCoach, type Client, type Coach } from '@/lib/services/firebaseService';
import { DataTable } from '@/components/admin/DataTable';

interface ClientWithCoach extends Client {
  coach?: Coach | null;
}

export default function ClientManagement() {
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
      header: 'Coach', 
      key: 'coach',
      render: (coach) => (
        <span className="text-gray-300">{coach?.name || 'No Coach'}</span>
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
    <div className="min-h-screen bg-[#13141A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Client Management</h1>
            <p className="text-gray-400">Monitor and manage your client base</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Client
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Clients</p>
                <h3 className="text-2xl font-bold text-white mt-1">156</h3>
                <p className="text-green-500 text-sm mt-1">+12 this month</p>
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
                <h3 className="text-2xl font-bold text-white mt-1">68%</h3>
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
                <h3 className="text-2xl font-bold text-white mt-1">42</h3>
                <p className="text-yellow-500 text-sm mt-1">27% of total</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1b1e] rounded-lg p-6">
          <DataTable
            columns={columns}
            data={filteredClients}
            actions={(client) => (
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                  View Profile
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700">
                  Progress Report
                </button>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
} 