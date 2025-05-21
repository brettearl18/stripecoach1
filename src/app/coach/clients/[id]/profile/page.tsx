import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

const mockClient = {
  id: '4',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  status: 'active',
  startDate: '2024-02-01',
  notes: 'Jane is progressing well. Focus on nutrition next month.',
  aiInsights: 'Jane has improved her workout consistency by 20% over the last 4 weeks. Recommend increasing protein intake.',
  checkInHistory: [
    { date: '2024-04-01', score: 88 },
    { date: '2024-03-25', score: 80 },
    { date: '2024-03-18', score: 75 },
  ],
};

export default function ClientProfile() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center py-16">
      <div className="bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center">
            <UserIcon className="h-10 w-10 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{mockClient.name}</h1>
            <p className="text-gray-400">{mockClient.email}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${mockClient.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>{mockClient.status}</span>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">AI Insights</h2>
          <p className="text-gray-300">{mockClient.aiInsights}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Coach Notes</h2>
          <p className="text-gray-300">{mockClient.notes}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Check-in History</h2>
          <ul className="space-y-1">
            {mockClient.checkInHistory.map((checkIn, idx) => (
              <li key={idx} className="text-gray-400">
                {new Date(checkIn.date).toLocaleDateString()} - Score: {checkIn.score}%
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 