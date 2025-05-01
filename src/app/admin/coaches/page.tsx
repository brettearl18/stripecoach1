'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getCoach, 
  getClientsByCoach, 
  type Coach, 
  type Client,
  createTestCoach,
  updateCoach,
  deleteCoach,
  getCoaches
} from '@/lib/services/firebaseService';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UsersIcon, 
  ChatBubbleLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { LastLoginBadge } from '@/components/ui/LastLoginBadge';
import { Timestamp } from 'firebase/firestore';

interface CoachWithStats extends Coach {
  stats: {
    activeClients: number;
    completionRate: number;
    revenue: number;
  };
}

export default function CoachManagement() {
  const router = useRouter();
  const [coaches, setCoaches] = useState<CoachWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialties: '',
    experience: ''
  });

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    try {
      setIsLoading(true);
      const coachesData = await getCoaches();
      
      const coachesWithStats = await Promise.all(
        coachesData.map(async (coach) => {
          const clients = await getClientsByCoach(coach.id!);
          return {
            ...coach,
            stats: {
              activeClients: Math.floor(Math.random() * 15) + 5, // 5-20 clients
              completionRate: Math.floor(Math.random() * 30) + 70, // 70-100%
              revenue: (Math.floor(Math.random() * 20) + 10) * 100 // $1000-$3000
            }
          };
        })
      );

      setCoaches(coachesWithStats);
    } catch (error) {
      console.error('Error loading coaches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert specialties string to array and trim whitespace
      const specialtiesArray = formData.specialties
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const coachData = {
        ...formData,
        specialties: specialtiesArray,
      };

      if (editingCoach) {
        await updateCoach(editingCoach.id!, coachData);
      } else {
        await createTestCoach(coachData);
      }

      setShowCreateModal(false);
      setEditingCoach(null);
      setFormData({ name: '', email: '', specialties: '', experience: '' });
      loadCoaches();
    } catch (error) {
      console.error('Error saving coach:', error);
    }
  };

  const handleDelete = async (coachId: string) => {
    if (window.confirm('Are you sure you want to delete this coach?')) {
      try {
        await deleteCoach(coachId);
        loadCoaches();
      } catch (error) {
        console.error('Error deleting coach:', error);
      }
    }
  };

  const handleViewClients = (coachId: string) => {
    router.push(`/admin/coaches/${coachId}/clients`);
  };

  const handleMessage = (coachId: string) => {
    router.push(`/admin/coaches/${coachId}/messages`);
  };

  // Add error handling for coaches without specialties
  const renderSpecialties = (coach: CoachWithStats) => {
    if (!coach.specialties || !Array.isArray(coach.specialties)) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {coach.specialties.map((specialty, index) => (
          <span key={index} className="bg-blue-500/10 text-blue-400 text-sm rounded-lg px-3 py-1">
            {specialty}
          </span>
        ))}
      </div>
    );
  };

  const filteredCoaches = coaches.filter(coach => 
    coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coach.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coach.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedCoaches = [...filteredCoaches].sort((a, b) => {
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

  const isOnline = (lastLoginAt: Timestamp | null | undefined) => {
    if (!lastLoginAt) return false;
    
    // If it's already a Date object
    if (lastLoginAt instanceof Date) {
      return new Date().getTime() - lastLoginAt.getTime() < 15 * 60 * 1000;
    }
    
    // If it's a Firestore Timestamp
    if (lastLoginAt instanceof Timestamp) {
      return new Date().getTime() - lastLoginAt.toDate().getTime() < 15 * 60 * 1000;
    }

    // If it's a regular timestamp number
    if (typeof lastLoginAt === 'number') {
      return new Date().getTime() - lastLoginAt < 15 * 60 * 1000;
    }

    return false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F15] to-[#1A1F2B] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading coaches...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F15] to-[#1A1F2B] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Coach Management
            </h1>
            <p className="text-gray-400 text-lg">Manage your coaching team and their assignments</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-lg shadow-blue-500/20"
          >
            <PlusIcon className="h-5 w-5" />
            Add Coach
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search coaches by name, email, or specialties..."
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

        {/* Coach Table */}
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
                      Coach
                      <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">Specialties</th>
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">
                    <button 
                      onClick={() => handleSort('stats.activeClients')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Active Clients
                      <SortIcon field="stats.activeClients" />
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
                      onClick={() => handleSort('stats.revenue')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Revenue
                      <SortIcon field="stats.revenue" />
                    </button>
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">
                    <button 
                      onClick={() => handleSort('lastLoginAt')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Last Login
                      <SortIcon field="lastLoginAt" />
                    </button>
                  </th>
                  <th className="px-6 py-5 text-right text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {sortedCoaches.map((coach) => (
                  <tr key={coach.id} className="group hover:bg-[#2A303C]/30 transition-colors duration-200">
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <UsersIcon className="h-6 w-6 text-blue-400" />
                          <div className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#1A1F2B] ${
                            isOnline(coach.lastLoginAt) ? 'bg-green-500' : 'bg-gray-500'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-100">{coach.name}</div>
                          <div className="text-sm text-gray-400">{coach.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {renderSpecialties(coach)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-lg font-semibold text-green-400">{coach.stats.activeClients}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-700/50 rounded-full h-2.5 mr-3 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              coach.stats.completionRate >= 90
                                ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                : coach.stats.completionRate >= 70
                                ? 'bg-gradient-to-r from-yellow-500 to-green-500'
                                : 'bg-gradient-to-r from-red-500 to-yellow-500'
                            }`}
                            style={{ width: `${coach.stats.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{coach.stats.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-lg font-semibold">${coach.stats.revenue.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-5">
                      <LastLoginBadge lastLoginAt={coach.lastLoginAt} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewClients(coach.id!)}
                          className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
                          title="View Clients"
                        >
                          <UsersIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleMessage(coach.id!)}
                          className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors text-purple-400 hover:text-purple-300"
                          title="Send Message"
                        >
                          <ChatBubbleLeftIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCoach(coach);
                            setFormData({
                              name: coach.name,
                              email: coach.email,
                              specialties: coach.specialties.join(', '),
                              experience: coach.experience
                            });
                            setShowCreateModal(true);
                          }}
                          className="p-2 hover:bg-yellow-500/10 rounded-lg transition-colors text-yellow-400 hover:text-yellow-300"
                          title="Edit Coach"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(coach.id!)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
                          title="Delete Coach"
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

        {/* Create/Edit Coach Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1A1F2B] rounded-xl p-6 w-full max-w-md border border-gray-800/50 shadow-xl">
              <h2 className="text-xl font-bold mb-4">
                {editingCoach ? 'Edit Coach' : 'Add New Coach'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#2A303C] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter coach name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#2A303C] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Specialties (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.specialties}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                    className="w-full bg-[#2A303C] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g. Weight Loss, Nutrition, Strength Training"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full bg-[#2A303C] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g. 5 years+"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingCoach(null);
                      setFormData({ name: '', email: '', specialties: '', experience: '' });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingCoach ? 'Save Changes' : 'Create Coach'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 