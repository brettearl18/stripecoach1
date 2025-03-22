'use client';

import { DataTable } from '@/components/admin/DataTable';
import { useState } from 'react';
import { UserCircleIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function BusinessAvatars() {
  const [avatars] = useState([
    {
      name: 'Sarah - Fitness Coach',
      type: 'Coach',
      personality: 'Motivational, Energetic',
      lastModified: '2024-03-22',
      status: 'Active'
    },
    {
      name: 'Mike - Nutrition Expert',
      type: 'Specialist',
      personality: 'Professional, Knowledgeable',
      lastModified: '2024-03-21',
      status: 'Active'
    },
    {
      name: 'Emma - Wellness Guide',
      type: 'Guide',
      personality: 'Calm, Supportive',
      lastModified: '2024-03-20',
      status: 'Draft'
    }
  ]);

  const columns = [
    {
      header: 'Avatar',
      key: 'name',
      render: (name) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
            <UserCircleIcon className="h-6 w-6" />
          </div>
          <div className="font-medium text-white">{name}</div>
        </div>
      )
    },
    { header: 'Type', key: 'type' },
    { header: 'Personality', key: 'personality' },
    { header: 'Last Modified', key: 'lastModified' },
    {
      header: 'Status',
      key: 'status',
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === 'Active'
              ? 'bg-green-500/10 text-green-500'
              : 'bg-yellow-500/10 text-yellow-500'
          }`}
        >
          {status}
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#13141A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Business Avatars</h1>
            <p className="text-gray-400">Manage your AI-powered business personas</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Avatar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Avatars</p>
                <h3 className="text-2xl font-bold text-white mt-1">8</h3>
                <p className="text-green-500 text-sm mt-1">+2 this month</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Avatars</p>
                <h3 className="text-2xl font-bold text-white mt-1">6</h3>
                <p className="text-green-500 text-sm mt-1">75% of total</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Interactions</p>
                <h3 className="text-2xl font-bold text-white mt-1">1.2k</h3>
                <p className="text-green-500 text-sm mt-1">+15% this week</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1b1e] rounded-lg p-6">
          <DataTable
            columns={columns}
            data={avatars}
            actions={(avatar) => (
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                  Edit
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700">
                  Preview
                </button>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
} 