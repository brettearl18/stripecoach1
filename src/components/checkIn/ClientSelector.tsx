'use client';

import { Fragment, useState, useEffect } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { getClients, type Client } from '@/lib/services/firebaseService';

interface ClientSelectorProps {
  selectedClients: Client[];
  onSelectionChange: (clients: Client[]) => void;
}

export default function ClientSelector({ selectedClients, onSelectionChange }: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const fetchedClients = await getClients();
        setClients(fetchedClients);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  const filteredClients = query === ''
    ? clients
    : clients.filter((client) =>
        client.name.toLowerCase().includes(query.toLowerCase()) ||
        client.email.toLowerCase().includes(query.toLowerCase())
      );

  const toggleClient = (client: Client) => {
    const isSelected = selectedClients.some(c => c.id === client.id);
    if (isSelected) {
      onSelectionChange(selectedClients.filter(c => c.id !== client.id));
    } else {
      onSelectionChange([...selectedClients, client]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Assign to Clients
        </label>
        <Combobox value={null} onChange={toggleClient}>
          <div className="relative">
            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-[#2A303A] text-left border border-gray-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
              <Combobox.Input
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-100 bg-transparent focus:ring-0"
                placeholder="Search clients..."
                displayValue={() => ''}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery('')}
            >
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#2A303A] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {isLoading ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-400">
                    Loading clients...
                  </div>
                ) : filteredClients.length === 0 && query !== '' ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-400">
                    Nothing found.
                  </div>
                ) : (
                  filteredClients.map((client) => {
                    const isSelected = selectedClients.some(c => c.id === client.id);
                    return (
                      <Combobox.Option
                        key={client.id}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-indigo-600 text-white' : 'text-gray-300'
                          }`
                        }
                        value={client}
                      >
                        {({ selected, active }) => (
                          <>
                            <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                              {client.name} ({client.email})
                            </span>
                            {isSelected ? (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                  active ? 'text-white' : 'text-indigo-500'
                                }`}
                              >
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Combobox.Option>
                    );
                  })
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      </div>

      {/* Selected Clients */}
      {selectedClients.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Selected Clients ({selectedClients.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedClients.map((client) => (
              <span
                key={client.id}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              >
                {client.name}
                <button
                  type="button"
                  onClick={() => toggleClient(client)}
                  className="ml-1 inline-flex items-center p-0.5 rounded-full hover:bg-indigo-500/20 transition-colors"
                >
                  <span className="sr-only">Remove</span>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 