'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  DocumentPlusIcon,
  ChevronDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { getCheckIns, getClientById, type CheckIn, type Client } from '@/lib/services/firebaseService';
import { DataTable } from '@/components/admin/DataTable';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import Link from 'next/link';

// Types for our check-in data
interface CheckInWithClient {
  id: string;
  clientId: string;
  type: string;
  date: string;
  status: 'pending' | 'completed';
  client?: {
    id: string;
    name: string;
    email: string;
  } | null;
  responses: {
    question: string;
    answer: string | number;
    type: 'text' | 'number' | 'scale' | 'options';
  }[];
}

interface CheckInTemplate {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  questions: {
    id: string;
    type: 'text' | 'number' | 'scale' | 'options';
    question: string;
    required: boolean;
    options?: string[];
  }[];
  assignedClients: number;
  lastUpdated: string;
}

// Mock data for development
const mockCheckIns: CheckInWithClient[] = [
  {
    id: '1',
    clientId: 'client1',
    type: 'Weekly Progress Check',
    date: '2024-03-15T10:30:00Z',
    status: 'completed',
    client: {
      id: 'client1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    responses: [
      {
        question: 'How was your energy level today?',
        answer: 4,
        type: 'scale'
      },
      {
        question: 'Did you complete all planned workouts?',
        answer: 'Yes, completed all 3 sessions',
        type: 'text'
      }
    ]
  },
  {
    id: '2',
    clientId: 'client2',
    type: 'Daily Nutrition Log',
    date: '2024-03-15T09:15:00Z',
    status: 'pending',
    client: {
      id: 'client2',
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    responses: [
      {
        question: 'Did you track your meals today?',
        answer: 'Yes',
        type: 'text'
      },
      {
        question: 'Water intake (liters)',
        answer: 2.5,
        type: 'number'
      }
    ]
  }
];

const mockTemplates: CheckInTemplate[] = [
  {
    id: '1',
    name: 'Weekly Progress Check',
    description: 'Track weekly progress including workouts, nutrition, and overall wellbeing',
    frequency: 'weekly',
    questions: [
      {
        id: 'q1',
        type: 'scale',
        question: 'How was your energy level this week? (1-5)',
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'What challenges did you face this week?',
        required: true
      }
    ],
    assignedClients: 12,
    lastUpdated: '2024-03-10T15:00:00Z'
  },
  {
    id: '2',
    name: 'Daily Nutrition Log',
    description: 'Track daily nutrition habits and water intake',
    frequency: 'daily',
    questions: [
      {
        id: 'q1',
        type: 'options',
        question: 'Did you follow your meal plan today?',
        required: true,
        options: ['Yes, completely', 'Mostly', 'Partially', 'No']
      },
      {
        id: 'q2',
        type: 'number',
        question: 'How many liters of water did you drink?',
        required: true
      }
    ],
    assignedClients: 8,
    lastUpdated: '2024-03-12T09:00:00Z'
  }
];

export default function CoachCheckIns() {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckInWithClient[]>(mockCheckIns);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState({ field: 'date', direction: 'desc' });
  const [activeTab, setActiveTab] = useState<'responses' | 'templates'>('responses');

  useEffect(() => {
    if (user) {
      loadCheckIns();
    }
  }, [user]);

  const loadCheckIns = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      const checkInsData = await getCheckIns(user.uid); // Only get check-ins for this coach
      
      // Fetch client data for each check-in
      const checkInsWithClients = await Promise.all(
        checkInsData.map(async (checkIn) => {
          let client = null;
          if (checkIn.clientId) {
            try {
              client = await getClientById(checkIn.clientId);
            } catch (error) {
              console.error(`Error fetching client for check-in ${checkIn.id}:`, error);
            }
          }
          return {
            ...checkIn,
            client
          };
        })
      );

      setCheckIns(checkInsWithClients);
    } catch (error) {
      console.error('Error loading check-ins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort check-ins
  const filteredCheckIns = checkIns
    .filter(checkIn => {
      const matchesSearch = searchTerm === '' || (
        (checkIn.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        checkIn.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = filterStatus === 'all' || checkIn.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const direction = sortBy.direction === 'desc' ? -1 : 1;
      if (sortBy.field === 'date') {
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * direction;
      }
      return 0;
    });

  const filteredTemplates = mockTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-white mb-2">Client Check-Ins</h1>
            <p className="text-gray-400">Monitor and review your client check-ins</p>
          </div>
          <Link
            href="/coach/templates-v2"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <DocumentPlusIcon className="h-5 w-5 mr-2" />
            Create Template
          </Link>
        </div>

        <div className="border-b border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('responses')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'responses'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'}
              `}
            >
              Check-in Responses
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'templates'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'}
              `}
            >
              Check-in Templates
            </button>
          </nav>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={activeTab === 'responses' ? "Search check-ins..." : "Search templates..."}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {activeTab === 'responses' && (
            <div className="flex-shrink-0">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800 text-gray-300"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          )}
        </div>

        {activeTab === 'responses' ? (
          <div className="bg-gray-800 shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredCheckIns.map((checkIn) => (
                  <tr key={checkIn.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                          <UserCircleIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{checkIn.client?.name}</div>
                          <div className="text-sm text-gray-400">{checkIn.client?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{checkIn.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {format(new Date(checkIn.date), 'MMM d, yyyy h:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${checkIn.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {checkIn.status.charAt(0).toUpperCase() + checkIn.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-500 hover:text-blue-400">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">{template.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full
                      ${template.frequency === 'daily' ? 'bg-blue-100 text-blue-800' :
                        template.frequency === 'weekly' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'}`}>
                      {template.frequency.charAt(0).toUpperCase() + template.frequency.slice(1)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">{template.description}</p>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                      {template.questions.length} Questions
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-400">
                      <UserGroupIcon className="h-5 w-5 mr-2" />
                      {template.assignedClients} Clients Assigned
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      Last updated {format(new Date(template.lastUpdated), 'MMM d, yyyy')}
                    </span>
                    <button className="text-sm text-blue-500 hover:text-blue-400">
                      Edit Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 