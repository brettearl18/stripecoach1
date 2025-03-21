'use client';

import { useState } from 'react';
import {
  CalendarIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const calendarProviders = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: '/google-calendar.png',
    description: 'Sync events with Google Calendar',
    color: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200'
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    icon: '/outlook-calendar.png',
    description: 'Sync events with Outlook Calendar',
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    icon: '/apple-calendar.png',
    description: 'Sync events with Apple Calendar',
    color: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200'
  }
];

export default function CalendarIntegration() {
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const handleConnect = (providerId) => {
    // This would integrate with your backend to handle OAuth flow
    console.log('Connecting to calendar:', providerId);
    
    // Simulate connection process
    setSyncing(true);
    setTimeout(() => {
      setConnectedCalendars(prev => [...prev, providerId]);
      setSyncing(false);
    }, 1500);
  };

  const handleDisconnect = (providerId) => {
    // This would integrate with your backend to remove calendar connection
    console.log('Disconnecting calendar:', providerId);
    setConnectedCalendars(prev => prev.filter(id => id !== providerId));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Calendar Integrations</h2>
        <p className="text-sm text-gray-500 mb-6">
          Connect your calendar to automatically sync scheduled events and keep everything in one place.
        </p>
        
        <div className="space-y-4">
          {calendarProviders.map((provider) => {
            const isConnected = connectedCalendars.includes(provider.id);
            
            return (
              <div
                key={provider.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${provider.borderColor} ${provider.color}`}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-white p-2 mr-4 flex items-center justify-center">
                    <CalendarIcon className={`w-8 h-8 ${provider.textColor}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{provider.name}</h3>
                    <p className="text-sm text-gray-500">{provider.description}</p>
                  </div>
                </div>
                
                <div>
                  {isConnected ? (
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      <button
                        onClick={() => handleDisconnect(provider.id)}
                        className="text-sm text-gray-500 hover:text-red-600"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnect(provider.id)}
                      disabled={syncing}
                      className={`flex items-center px-4 py-2 rounded-lg border border-gray-300 
                        bg-white text-sm font-medium text-gray-700 hover:bg-gray-50
                        ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {syncing && <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />}
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Two-way Sync</h3>
          <p className="text-sm text-yellow-700">
            Events will be synced both ways. Changes made in either calendar will be reflected in the other.
          </p>
        </div>
      </div>
    </div>
  );
} 