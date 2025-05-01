'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ChevronUpDownIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface ClientWithStats {
  id: string;
  name: string;
  email: string;
  completionRate: number;
  checkInsCompleted: number;
  weightChange: number;
  timeInProgram: string;
  lastLogin: string;
}

export default function CoachClientsPage() {
  const params = useParams();
  const router = useRouter();
  const [coach, setCoach] = useState({ name: 'Loading...' });
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const coachData = await getCoach(params.id);
        setCoach(coachData);
        const clientsData = await getClientsByCoach(params.id);
        setClients(clientsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Coaches
        </button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{coach.name}'s Clients</h1>
            <p className="text-gray-400">Manage and monitor client progress</p>
          </div>
          <div className="flex gap-4">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              onClick={() => router.push(`/admin/coaches/${params.id}/messages`)}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              Messages
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              onClick={() => router.push(`/admin/coaches/${params.id}/edit`)}
            >
              <PencilSquareIcon className="h-5 w-5" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Clients Table */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  <div className="flex items-center cursor-pointer">
                    Client
                    <ChevronUpDownIcon className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Completion Rate</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Check-ins</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Weight Change</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Time in Program</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Last Login</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                    Loading clients...
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-400">{client.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${client.completionRate}%` }}
                          />
                        </div>
                        <span className="ml-2">{client.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{client.checkInsCompleted}</td>
                    <td className="px-6 py-4">
                      <span className={client.weightChange < 0 ? 'text-green-500' : 'text-red-500'}>
                        {client.weightChange} kg
                      </span>
                    </td>
                    <td className="px-6 py-4">{client.timeInProgram}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400">{client.lastLogin}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm bg-indigo-600 rounded hover:bg-indigo-700 transition-colors">
                          View
                        </button>
                        <button className="px-3 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 