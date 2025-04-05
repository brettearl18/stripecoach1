'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { getCheckIns, getClientById, type CheckIn, type Client } from '@/lib/services/firebaseService';
import { DataTable } from '@/components/admin/DataTable';
import { useAuth } from '@/hooks/useAuth';

interface CheckInWithClient extends CheckIn {
  client?: Client | null;
}

export default function CoachCheckIns() {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckInWithClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState({ field: 'date', direction: 'desc' });

  useEffect(() => {
    if (user) {
      loadCheckIns();
    }
  }, [user]);

  const loadCheckIns = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      const checkInsData = await getCheckIns(user.uid); // Only get check-ins for this coach
      
      // Fetch client data for each check-in
      const checkInsWithClients = await Promise.all(
        checkInsData.map(async (checkIn) => {
          let client = null;
          if (checkIn.clientId) {
            try {
              client = await getClientById(checkIn.clientId);
            } catch (error) {
              console.error(`Error fetching client for check-in ${checkIn.id}:`, error);
            }
          }
          return {
            ...checkIn,
            client
          };
        })
      );

      setCheckIns(checkInsWithClients);
    } catch (error) {
      console.error('Error loading check-ins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort check-ins
  const filteredCheckIns = checkIns
    .filter(checkIn => {
      const matchesSearch = searchTerm === '' || (
        (checkIn.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (checkIn.type || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = filterStatus === 'all' || checkIn.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const direction = sortBy.direction === 'desc' ? -1 : 1;
      if (sortBy.field === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime() * direction;
      }
      return 0;
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#13141A] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <ArrowPathIcon className="w-5 h-5 animate-spin" />
          Loading check-ins...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13141A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Client Check-Ins</h1>
            <p className="text-gray-400">Monitor and review your client check-ins</p>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search check-ins..."
              className="px-4 py-2 rounded-lg bg-[#1a1b1e] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-4 py-2 rounded-lg bg-[#1a1b1e] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Check-Ins</p>
                <h3 className="text-2xl font-bold text-white mt-1">{checkIns.length}</h3>
                <p className="text-green-500 text-sm mt-1">
                  +{checkIns.filter(c => new Date(c.date).toDateString() === new Date().toDateString()).length} today
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Review</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {checkIns.filter(c => c.status === 'pending').length}
                </h3>
                <p className="text-yellow-500 text-sm mt-1">Requires attention</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Score</p>
                <h3 className="text-2xl font-bold text-white mt-1">4.2/5</h3>
                <p className="text-green-500 text-sm mt-1">+0.3 this week</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1b1e] rounded-lg p-6">
          <DataTable
            columns={[
              {
                header: 'Client',
                key: 'client',
                render: (client, checkIn) => (
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
                      <UserCircleIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{client?.name || 'Unknown Client'}</div>
                      <div className="text-sm text-gray-400">{checkIn.type}</div>
                    </div>
                  </div>
                )
              },
              {
                header: 'Date',
                key: 'date',
                render: (date) => (
                  <span className="text-gray-300">{new Date(date).toLocaleDateString()}</span>
                )
              },
              {
                header: 'Status',
                key: 'status',
                render: (status) => (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    status === 'pending'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-green-500/10 text-green-500'
                  }`}>
                    {status === 'pending' ? 'Pending Review' : 'Completed'}
                  </span>
                )
              }
            ]}
            data={filteredCheckIns}
            actions={(checkIn) => (
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.location.href = `/coach/check-ins/${checkIn.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                >
                  View Details
                </button>
                {checkIn.status === 'pending' && (
                  <button 
                    onClick={() => {/* TODO: Implement mark as reviewed */}}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
                  >
                    Mark as Reviewed
                  </button>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
} 