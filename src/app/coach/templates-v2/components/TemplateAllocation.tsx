import { useState } from 'react';
import { ChevronRightIcon, UserPlusIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface ClientAllocation {
  clientId: string;
  athleteLevel: 'beginner' | 'intermediate' | 'professional';
  frequency: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    value?: number;
  };
  startDate: string;
  checkInWindow: number;
}

interface TemplateAllocationProps {
  onSave: (allocations: ClientAllocation[]) => void;
  onBack: () => void;
  defaultSettings: {
    frequency: {
      type: 'daily' | 'weekly' | 'monthly' | 'custom';
      value?: number;
    };
    checkInWindow?: number;
  };
}

export default function TemplateAllocation({ onSave, onBack, defaultSettings }: TemplateAllocationProps) {
  const [selectedClients, setSelectedClients] = useState<Record<string, ClientAllocation>>({});
  const [showClientSearch, setShowClientSearch] = useState(false);

  // Get tomorrow's date as the default start date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Mock clients data - replace with actual API call
  const clients: Client[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    // Add more mock clients as needed
  ];

  const handleClientSelect = (client: Client) => {
    setSelectedClients(prev => ({
      ...prev,
      [client.id]: {
        clientId: client.id,
        athleteLevel: 'intermediate',
        frequency: defaultSettings.frequency,
        startDate: getTomorrowDate(),
        checkInWindow: defaultSettings.checkInWindow || 7
      }
    }));
    setShowClientSearch(false);
  };

  const handleUpdateClientSettings = (clientId: string, updates: Partial<ClientAllocation>) => {
    setSelectedClients(prev => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        ...updates
      }
    }));
  };

  const handleSave = () => {
    onSave(Object.values(selectedClients));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Allocate Template</h2>
        <p className="text-gray-400">
          Select clients and customize their settings for this template.
        </p>
      </div>

      {/* Client Selection */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-medium text-white">Selected Clients</h3>
          <button
            onClick={() => setShowClientSearch(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <UserPlusIcon className="w-5 h-5" />
            Add Client
          </button>
        </div>

        {/* Client Search Modal */}
        {showClientSearch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-[#1C1C1F] rounded-lg p-6 w-full max-w-md">
              <h4 className="text-lg font-medium text-white mb-4">Select Clients</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {clients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
                    className="w-full p-4 bg-[#2C2C30] rounded-lg hover:bg-[#3C3C40] transition-colors text-left"
                  >
                    <div className="text-white font-medium">{client.name}</div>
                    <div className="text-gray-400 text-sm">{client.email}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowClientSearch(false)}
                className="mt-4 px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Selected Clients List */}
        <div className="space-y-4">
          {Object.entries(selectedClients).map(([clientId, allocation]) => {
            const client = clients.find(c => c.id === clientId);
            if (!client) return null;

            return (
              <div key={clientId} className="bg-[#1C1C1F] rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-white font-medium">{client.name}</div>
                    <div className="text-gray-400 text-sm">{client.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      const newSelected = { ...selectedClients };
                      delete newSelected[clientId];
                      setSelectedClients(newSelected);
                    }}
                    className="text-gray-400 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Athlete Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Athlete Level
                    </label>
                    <select
                      value={allocation.athleteLevel}
                      onChange={(e) => handleUpdateClientSettings(clientId, {
                        athleteLevel: e.target.value as ClientAllocation['athleteLevel']
                      })}
                      className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={allocation.startDate}
                      min={getTomorrowDate()}
                      onChange={(e) => handleUpdateClientSettings(clientId, {
                        startDate: e.target.value
                      })}
                      className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Check-in Frequency
                    </label>
                    <select
                      value={allocation.frequency.type}
                      onChange={(e) => handleUpdateClientSettings(clientId, {
                        frequency: { type: e.target.value as ClientAllocation['frequency']['type'] }
                      })}
                      className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  {/* Check-in Window */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Check-in Window (days)
                    </label>
                    <input
                      type="number"
                      value={defaultSettings.checkInWindow || 7}
                      readOnly
                      className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white opacity-70 cursor-not-allowed"
                    />
                  </div>

                  {/* Custom Frequency Input */}
                  {allocation.frequency.type === 'custom' && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Custom Frequency (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={allocation.frequency.value || ''}
                        onChange={(e) => handleUpdateClientSettings(clientId, {
                          frequency: { type: 'custom', value: parseInt(e.target.value) }
                        })}
                        className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white"
                        placeholder="Enter number of days"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2.5 text-gray-400 hover:text-white"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={Object.keys(selectedClients).length === 0}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save & Allocate Template
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 