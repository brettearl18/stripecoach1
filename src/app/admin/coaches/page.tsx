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
  ChevronDownIcon
} from '@heroicons/react/24/outline';

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
      const coachData = {
        ...formData,
        specialties: formData.specialties.split(',').map(s => s.trim()),
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

        {/* Coach Table */}
        <div className="bg-[#1A1F2B]/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/50 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#2A303C]/50">
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">Coach</th>
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">Specialties</th>
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">Active Clients</th>
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">Completion Rate</th>
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-300">Revenue</th>
                  <th className="px-6 py-5 text-right text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {coaches.map((coach) => (
                  <tr key={coach.id} className="hover:bg-[#2A303C]/30 transition-colors duration-200">
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <UsersIcon className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-100">{coach.name}</div>
                          <div className="text-sm text-gray-400">{coach.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {coach.specialties.map((specialty, index) => (
                          <span key={index} className="bg-blue-500/10 text-blue-400 text-sm rounded-lg px-3 py-1">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-lg font-semibold text-green-400">{coach.stats.activeClients}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-700/50 rounded-full h-2.5 mr-3">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-400 h-2.5 rounded-full"
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
                      <div className="flex items-center justify-end gap-2">
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

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-[#1A1F2B] rounded-xl p-8 w-full max-w-md border border-gray-800/50 shadow-xl">
              <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                {editingCoach ? 'Edit Coach' : 'Add New Coach'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#2A303C] rounded-lg px-4 py-2.5 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#2A303C] rounded-lg px-4 py-2.5 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Specialties (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.specialties}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                    className="w-full bg-[#2A303C] rounded-lg px-4 py-2.5 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Experience</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full bg-[#2A303C] rounded-lg px-4 py-2.5 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingCoach(null);
                      setFormData({ name: '', email: '', specialties: '', experience: '' });
                    }}
                    className="px-4 py-2.5 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-white/5 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg transition-all duration-200 text-sm font-medium shadow-lg shadow-blue-500/20"
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