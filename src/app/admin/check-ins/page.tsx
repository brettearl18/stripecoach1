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
import { getCheckIns, getCoach, type CheckIn, type Coach } from '@/lib/services/firebaseService';
import { DataTable } from '@/components/admin/DataTable';

interface CheckInWithCoach extends CheckIn {
  coach?: Coach | null;
}

export default function FormCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckInWithCoach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState({ field: 'date', direction: 'desc' });

  useEffect(() => {
    loadCheckIns();
  }, []);

  const loadCheckIns = async () => {
    try {
      setIsLoading(true);
      const checkInsData = await getCheckIns();
      
      // Fetch coach data for each check-in
      const checkInsWithCoaches = await Promise.all(
        checkInsData.map(async (checkIn) => {
          let coach = null;
          if (checkIn.coachId) {
            try {
              coach = await getCoach(checkIn.coachId);
            } catch (error) {
              console.error(`Error fetching coach for check-in ${checkIn.id}:`, error);
            }
          }
          return {
            ...checkIn,
            coach
          };
        })
      );

      setCheckIns(checkInsWithCoaches);
    } catch (error) {
      console.error('Error loading check-ins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort check-ins
  const filteredCheckIns = checkIns
    .filter(checkIn => {
      const matchesSearch = 
        checkIn.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        checkIn.type.toLowerCase().includes(searchTerm.toLowerCase());
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
            <h1 className="text-3xl font-bold text-white mb-2">Form Check-Ins</h1>
            <p className="text-gray-400">Monitor and review client form submissions</p>
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
                <p className="text-green-500 text-sm mt-1">+24 today</p>
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
                key: 'clientName',
                render: (name, checkIn) => (
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
                      <UserCircleIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{name}</div>
                      <div className="text-sm text-gray-400">{checkIn.type}</div>
                    </div>
                  </div>
                )
              },
              {
                header: 'Coach',
                key: 'coach',
                render: (coach) => (
                  <span className="text-gray-300">{coach?.name || 'Unassigned'}</span>
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
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                  View Details
                </button>
                {checkIn.status === 'pending' && (
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700">
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