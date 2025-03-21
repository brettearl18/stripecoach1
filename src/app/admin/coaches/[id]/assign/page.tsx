'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getCoach, getClientsByCoach, getUnassignedClients, assignClientsToCoach, unassignClientFromCoach, type Coach, type Client } from '@/lib/services/firebaseService';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface UnassignedClient extends Client {
  isSelected: boolean;
}

export default function CoachAssignment() {
  const params = useParams();
  const coachId = params.id as string;
  const [coach, setCoach] = useState<Coach | null>(null);
  const [assignedClients, setAssignedClients] = useState<Client[]>([]);
  const [unassignedClients, setUnassignedClients] = useState<UnassignedClient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [coachId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const coachData = await getCoach(coachId);
      if (coachData) {
        setCoach(coachData);
        const clients = await getClientsByCoach(coachId);
        setAssignedClients(clients);
        
        const unassignedClientsData = await getUnassignedClients();
        setUnassignedClients(unassignedClientsData.map(client => ({
          ...client,
          isSelected: false
        })));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleClientSelection = (clientId: string) => {
    setUnassignedClients(clients =>
      clients.map(client =>
        client.id === clientId
          ? { ...client, isSelected: !client.isSelected }
          : client
      )
    );
  };

  const handleAssign = async () => {
    try {
      const selectedClients = unassignedClients.filter(client => client.isSelected);
      await assignClientsToCoach(selectedClients.map(client => client.id!), coachId);
      await loadData(); // Reload data after assignment
    } catch (error) {
      console.error('Error assigning clients:', error);
    }
  };

  const handleUnassign = async (clientId: string) => {
    try {
      await unassignClientFromCoach(clientId);
      await loadData(); // Reload data after unassignment
    } catch (error) {
      console.error('Error unassigning client:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F15] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-[#0B0F15] flex items-center justify-center text-white">
        Coach not found
      </div>
    );
  }

  const filteredUnassignedClients = unassignedClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F15] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{coach.name}</h1>
          <p className="text-gray-400">{coach.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assigned Clients */}
          <div className="bg-[#1A1F2B] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Assigned Clients</h2>
            <div className="space-y-4">
              {assignedClients.map((client) => (
                <div key={client.id} className="bg-[#2A303C] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{client.name}</h3>
                      <p className="text-sm text-gray-400">{client.email}</p>
                    </div>
                    <button
                      onClick={() => handleUnassign(client.id!)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Unassign
                    </button>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-400">Goals</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {client.goals.map((goal, index) => (
                        <span key={index} className="bg-blue-500/10 text-blue-400 text-sm rounded-lg px-3 py-1">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unassigned Clients */}
          <div className="bg-[#1A1F2B] rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Unassigned Clients</h2>
              <button
                onClick={handleAssign}
                disabled={!unassignedClients.some(client => client.isSelected)}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
              >
                Assign Selected
              </button>
            </div>

            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full bg-[#2A303C] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
              />
            </div>

            <div className="space-y-4">
              {filteredUnassignedClients.map((client) => (
                <div
                  key={client.id}
                  className={`bg-[#2A303C] rounded-lg p-4 cursor-pointer transition-colors ${
                    client.isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => toggleClientSelection(client.id!)}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={client.isSelected}
                      onChange={() => toggleClientSelection(client.id!)}
                      className="mt-1"
                    />
                    <div>
                      <h3 className="font-medium">{client.name}</h3>
                      <p className="text-sm text-gray-400">{client.email}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-400">Goals</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {client.goals.map((goal, index) => (
                        <span key={index} className="bg-blue-500/10 text-blue-400 text-sm rounded-lg px-3 py-1">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 