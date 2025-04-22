'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  ArrowRightIcon,
  Square2StackIcon,
  UserGroupIcon,
  SparklesIcon,
  BellIcon,
  CheckboxIcon,
  CheckIcon,
  ChevronUpDownIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { getClients } from '@/lib/services/firebaseService';
import { cn } from '@/lib/utils';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface WeeklyCheckIn {
  week: number;
  score: number;
  date: Date;
  status: 'pending' | 'completed' | 'missed';
}

interface Client {
  id?: string;
  name: string;
  email: string;
  coachId: string;
  goals: string[];
  avatar?: string;
  program?: string;
  lastLoginAt?: Date;
  lastCheckIn?: Date;
  isActive: boolean;
  pendingCheckIns?: number;
  checkInHistory: WeeklyCheckIn[];
  currentCompliance: number;
  hasPendingCheckIn: boolean;
  aiSummary: string;
  checkInDeadline: Date;
  currentWeek: number;
  phase: string;
}

interface BulkAction {
  type: 'reminder';
  clientIds: string[];
}

// Helper function to get check-in status and color
const getCheckInStatus = (lastCheckIn?: Date) => {
  if (!lastCheckIn) return { status: 'No check-ins', color: 'text-gray-400 bg-gray-500/10' };
  
  const daysSinceLastCheckIn = Math.floor((new Date().getTime() - lastCheckIn.getTime()) / (1000 * 3600 * 24));
  
  if (daysSinceLastCheckIn <= 1) {
    return { status: 'Recent', color: 'text-green-400 bg-green-500/10' };
  } else if (daysSinceLastCheckIn <= 3) {
    return { status: 'Due Soon', color: 'text-yellow-400 bg-yellow-500/10' };
  } else {
    return { status: 'Overdue', color: 'text-red-400 bg-red-500/10' };
  }
};

// Helper function to get status color
const getStatusColor = (score: number) => {
  if (score >= 85) return 'bg-green-500';
  if (score >= 70) return 'bg-orange-500';
  return 'bg-red-500';
};

// Helper function to get check-in square color
const getCheckInColor = (checkIn: WeeklyCheckIn | undefined) => {
  if (!checkIn || checkIn.status === 'missed') return 'bg-gray-700';
  if (checkIn.status === 'pending') return 'bg-blue-500/50';
  if (checkIn.score >= 85) return 'bg-green-500/90';
  if (checkIn.score >= 70) return 'bg-orange-500/90';
  return 'bg-red-500/90';
};

const CheckInHistory = ({ history }: { history: WeeklyCheckIn[] }) => {
  // Get last 5 weeks of check-ins
  const lastFiveWeeks = [...Array(5)].map((_, i) => {
    return history.find(h => h.week === i + 1);
  }).reverse();

  return (
    <div className="flex gap-1.5">
      {lastFiveWeeks.map((checkIn, index) => (
        <div
          key={index}
          className={cn(
            "w-6 h-6 rounded-sm flex items-center justify-center text-xs font-medium text-white",
            getCheckInColor(checkIn)
          )}
          title={checkIn ? `Week ${checkIn.week}: ${checkIn.score}%` : 'No check-in'}
        >
          {checkIn?.status === 'pending' && '?'}
        </div>
      ))}
    </div>
  );
};

const ComplianceIndicator = ({ score, isPending }: { score: number; isPending: boolean }) => {
  if (isPending) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400">
        <Square2StackIcon className="h-4 w-4 mr-1.5" />
        Pending Review
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium",
        getStatusColor(score)
      )}>
        {score}%
      </div>
    </div>
  );
};

const AISummary = ({ summary, clientName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  
  return (
    <>
      <div className="flex items-center gap-1.5 max-w-full">
        <SparklesIcon className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
        <div className="flex items-center gap-1 min-w-0">
          <p 
            ref={(element) => {
              if (element) {
                setIsTruncated(element.scrollWidth > element.clientWidth);
              }
            }}
            className="text-sm text-gray-300 truncate"
          >
            {summary}
          </p>
          {isTruncated && (
            <button
              onClick={() => setIsOpen(true)}
              className="text-xs text-purple-400 hover:text-purple-300 flex-shrink-0 font-medium"
            >
              See more
            </button>
          )}
        </div>
      </div>

      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-gray-800 p-6 shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <SparklesIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <Dialog.Title className="text-lg font-medium text-white mb-1">
                        AI Insights for {clientName}
                      </Dialog.Title>
                      <Dialog.Description className="text-gray-300 text-sm leading-relaxed">
                        {summary}
                      </Dialog.Description>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

// Add these helper functions at the top of the file
const isWithinReminderWindow = (checkInDeadline: Date) => {
  const now = new Date();
  const threeHoursBeforeDeadline = new Date(checkInDeadline.getTime() - (3 * 60 * 60 * 1000));
  return now >= threeHoursBeforeDeadline && now <= checkInDeadline;
};

const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isActive: true,
    checkInHistory: [
      { week: 1, score: 92, date: new Date('2024-03-20'), status: 'completed' },
      { week: 2, score: 88, date: new Date('2024-03-13'), status: 'completed' },
      { week: 3, score: 95, date: new Date('2024-03-06'), status: 'completed' },
      { week: 4, score: 90, date: new Date('2024-02-28'), status: 'completed' },
      { week: 5, score: 87, date: new Date('2024-02-21'), status: 'completed' }
    ],
    currentCompliance: 92,
    hasPendingCheckIn: false,
    aiSummary: "Consistently high performer, showing excellent adherence to program",
    checkInDeadline: new Date(Date.now() + (24 * 60 * 60 * 1000)),
    currentWeek: 12,
    phase: 'Phase 1'
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'https://i.pravatar.cc/150?img=2',
    isActive: true,
    checkInHistory: [
      { week: 1, score: 75, date: new Date('2024-03-20'), status: 'pending' },
      { week: 2, score: 82, date: new Date('2024-03-13'), status: 'completed' },
      { week: 3, score: 78, date: new Date('2024-03-06'), status: 'completed' },
      { week: 4, score: 73, date: new Date('2024-02-28'), status: 'completed' },
      { week: 5, score: 68, date: new Date('2024-02-21'), status: 'completed' }
    ],
    currentCompliance: 75,
    hasPendingCheckIn: true,
    aiSummary: "Recent decline in check-in scores, may need additional support",
    checkInDeadline: new Date(Date.now() + (2 * 60 * 60 * 1000)),
    currentWeek: 20,
    phase: 'Phase 2'
  },
  {
    id: '3',
    name: 'Emma Wilson',
    isActive: true,
    checkInHistory: [
      { week: 1, score: 0, date: new Date('2024-03-20'), status: 'missed' },
      { week: 2, score: 65, date: new Date('2024-03-13'), status: 'completed' },
      { week: 3, score: 72, date: new Date('2024-03-06'), status: 'completed' },
      { week: 4, score: 68, date: new Date('2024-02-28'), status: 'completed' },
      { week: 5, score: 70, date: new Date('2024-02-21'), status: 'completed' }
    ],
    currentCompliance: 65,
    hasPendingCheckIn: false,
    aiSummary: "Struggling with consistency, missed last check-in",
    checkInDeadline: new Date(Date.now() + (24 * 60 * 60 * 1000)),
    currentWeek: 8,
    phase: 'Phase 1'
  },
  {
    id: '4',
    name: 'David Rodriguez',
    avatar: 'https://i.pravatar.cc/150?img=4',
    isActive: true,
    checkInHistory: [
      { week: 1, score: 88, date: new Date('2024-03-20'), status: 'completed' },
      { week: 2, score: 85, date: new Date('2024-03-13'), status: 'completed' },
      { week: 3, score: 0, date: new Date('2024-03-06'), status: 'missed' },
      { week: 4, score: 92, date: new Date('2024-02-28'), status: 'completed' },
      { week: 5, score: 87, date: new Date('2024-02-21'), status: 'completed' }
    ],
    currentCompliance: 88,
    hasPendingCheckIn: false,
    aiSummary: "Strong recovery after missed check-in, back on track",
    checkInDeadline: new Date(Date.now() + (24 * 60 * 60 * 1000)),
    currentWeek: 16,
    phase: 'Phase 1'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isActive: true,
    checkInHistory: [
      { week: 1, score: 78, date: new Date('2024-03-20'), status: 'pending' },
      { week: 2, score: 82, date: new Date('2024-03-13'), status: 'completed' },
      { week: 3, score: 85, date: new Date('2024-03-06'), status: 'completed' },
      { week: 4, score: 80, date: new Date('2024-02-28'), status: 'completed' },
      { week: 5, score: 75, date: new Date('2024-02-21'), status: 'completed' }
    ],
    currentCompliance: 80,
    hasPendingCheckIn: true,
    aiSummary: "Moderate performance with room for improvement",
    checkInDeadline: new Date(Date.now() + (24 * 60 * 60 * 1000)),
    currentWeek: 4,
    phase: 'Phase 1'
  }
];

// Custom Checkbox Component
const Checkbox = ({ checked, indeterminate = false }) => {
  return (
    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors duration-200 ${
      checked
        ? 'bg-blue-500 border-blue-500'
        : indeterminate
        ? 'bg-blue-500/50 border-blue-500'
        : 'border-gray-600'
    }`}>
      {(checked || indeterminate) && (
        <CheckIcon className="w-3 h-3 text-white" />
      )}
    </div>
  );
};

type SortField = 'name' | 'currentWeek' | 'currentCompliance';
type SortOrder = 'asc' | 'desc';

const ClientsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());

  // Move useMemo here, before any useEffect
  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'currentWeek':
          comparison = (a.currentWeek || 0) - (b.currentWeek || 0);
          break;
        case 'currentCompliance':
          comparison = (a.currentCompliance || 0) - (b.currentCompliance || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [clients, sortField, sortOrder]);

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      try {
        if (!user) {
          setClients([]);
          return;
        }
        
        // For now, use mock data
        setClients(MOCK_CLIENTS);
        
        // Uncomment when ready to use real data
        // const fetchedClients = await getClients(user.uid);
        // setClients(fetchedClients);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadClients();
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#13141A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#13141A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Please log in to view your clients</p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(value as SortField);
      setSortOrder('asc');
    }
  };

  const filteredClients = clients.filter(client => {
    const nameMatch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'all' ? true :
                       statusFilter === 'active' ? client.isActive :
                       statusFilter === 'inactive' ? !client.isActive : true;
    
    return nameMatch && statusMatch;
  });

  const handleBulkAction = (action: BulkAction) => {
    if (action.type === 'reminder') {
      console.log('Sending reminders to:', action.clientIds);
      // Implement reminder sending logic here
    }
  };

  const toggleClientSelection = (clientId: string) => {
    const newSelection = new Set(selectedClients);
    if (newSelection.has(clientId)) {
      newSelection.delete(clientId);
    } else {
      newSelection.add(clientId);
    }
    setSelectedClients(newSelection);
  };

  const toggleAllClients = () => {
    if (selectedClients.size === clients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(clients.map(c => c.id)));
    }
  };

  const navigateToProfile = (clientId: string, e: React.MouseEvent) => {
    // Prevent checkbox click event from triggering
    e.stopPropagation();
    router.push(`/coach/clients/${clientId}/profile`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header Section with Optimized Spacing */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Clients
          </h1>
          <p className="text-sm text-gray-400">Monitor client check-ins and compliance</p>
        </div>
        <button
          onClick={() => {/* Add client handler */}}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm"
        >
          <UserPlusIcon className="w-4 h-4" />
          Add New Client
        </button>
      </div>

      {/* Search and Filters Section */}
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
            <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />
            <select
              value={sortField}
              onChange={handleSortChange}
              className="bg-transparent text-sm focus:outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="currentWeek">Sort by Progress</option>
              <option value="currentCompliance">Sort by Status</option>
            </select>
          </div>
          <button
            onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-2 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Status Filter */}
        <select className="px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm">
          <option value="all">All Clients</option>
          <option value="pending">Pending Review</option>
          <option value="at-risk">At Risk</option>
          <option value="on-track">On Track</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedClients.size > 0 && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
          <span className="text-sm text-gray-400">{selectedClients.size} selected</span>
          <button
            onClick={() => handleBulkAction({ type: 'reminder', clientIds: Array.from(selectedClients) })}
            className="px-3 py-1.5 text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded-lg transition-colors duration-200 flex items-center gap-1.5"
          >
            <BellIcon className="w-3.5 h-3.5" />
            Send Reminders
          </button>
          <button
            onClick={() => setSelectedClients(new Set())}
            className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Clients Table with Updated Layout */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="grid grid-cols-[auto,minmax(180px,1fr),100px,220px,100px,100px,minmax(300px,2fr)] gap-x-[30px] px-4 py-3 bg-gray-750 border-b border-gray-700 text-xs font-medium text-gray-400 uppercase tracking-wider">
          <div className="flex items-center">
            <button
              onClick={toggleAllClients}
              className="hover:opacity-80 transition-opacity"
            >
              <Checkbox 
                checked={selectedClients.size === clients.length}
                indeterminate={selectedClients.size > 0 && selectedClients.size < clients.length}
              />
            </button>
          </div>
          <div className="pr-2">CLIENT</div>
          <div>PROGRESS</div>
          <div>CHECK-IN HISTORY</div>
          <div>STATUS</div>
          <div>ACTION</div>
          <div>AI INSIGHTS</div>
        </div>

        <div className="divide-y divide-gray-700">
          {sortedClients.map((client) => (
            <div 
              key={client.id}
              className="grid grid-cols-[auto,minmax(180px,1fr),100px,220px,100px,100px,minmax(300px,2fr)] gap-x-[30px] px-4 py-3 items-center hover:bg-gray-750 transition-colors duration-150"
            >
              {/* Checkbox */}
              <div className="flex items-center">
                <button
                  onClick={() => toggleClientSelection(client.id)}
                  className="hover:opacity-80 transition-opacity"
                >
                  <Checkbox checked={selectedClients.has(client.id)} />
                </button>
              </div>

              {/* Client Info - with smaller right padding */}
              <div className="flex items-center gap-2 pr-2">
                {client.avatar ? (
                  <button
                    onClick={(e) => navigateToProfile(client.id, e)}
                    className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                  >
                    <img src={client.avatar} alt="" className="w-8 h-8 rounded-full" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => navigateToProfile(client.id, e)}
                    className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-sm hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {client.name.charAt(0)}
                  </button>
                )}
                <div className="min-w-0">
                  <button
                    onClick={(e) => navigateToProfile(client.id, e)}
                    className="font-medium text-sm truncate hover:text-blue-400 transition-colors text-left focus:outline-none focus:text-blue-400"
                  >
                    {client.name}
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="flex flex-col items-start">
                <div className="text-sm font-medium text-white">
                  Week {client.currentWeek}
                </div>
                <div className="text-xs text-gray-400">
                  {client.phase}
                </div>
              </div>

              {/* Check-in History */}
              <div className="flex gap-1.5">
                {client.checkInHistory.map((checkIn, index) => (
                  <div
                    key={index}
                    className={`w-7 h-7 rounded flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                      checkIn.status === 'completed'
                        ? checkIn.score >= 85
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : checkIn.score >= 70
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : checkIn.status === 'pending'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-700/50 text-gray-500 border border-gray-600/30'
                    }`}
                    title={`Week ${checkIn.week}: ${checkIn.score}% - ${checkIn.status}`}
                  >
                    {checkIn.status === 'pending' ? '?' : checkIn.score}
                  </div>
                ))}
              </div>

              {/* Status */}
              <div>
                {client.hasPendingCheckIn ? (
                  <div className="flex items-center gap-1.5 text-sm">
                    <ClockIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-400">Pending Review</span>
                  </div>
                ) : (
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    ${client.currentCompliance >= 85 ? 'bg-green-500/20 text-green-400' :
                      client.currentCompliance >= 70 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'}`}>
                    {client.currentCompliance}%
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div>
                {client.hasPendingCheckIn && isWithinReminderWindow(client.checkInDeadline) ? (
                  <button
                    onClick={() => {/* Send reminder handler */}}
                    className="px-3 py-1.5 text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded-lg transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <BellIcon className="w-3.5 h-3.5" />
                    Remind
                  </button>
                ) : (
                  <button
                    onClick={() => {/* View check-ins handler */}}
                    className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                    View
                  </button>
                )}
              </div>

              {/* AI Summary */}
              <div className="min-w-0 max-w-full">
                <AISummary 
                  summary={client.aiSummary}
                  clientName={client.name}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State - Optimized */}
      {clients.length === 0 && !loading && (
        <div className="text-center py-8">
          <UserGroupIcon className="w-10 h-10 mx-auto text-gray-600 mb-3" />
          <h3 className="text-base font-medium text-gray-300 mb-1">No clients found</h3>
          <p className="text-sm text-gray-500">Add your first client to get started</p>
        </div>
      )}

      {/* Loading State - Optimized */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage; 