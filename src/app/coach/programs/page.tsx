'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ProgramTemplate } from '@/types/program';
import { programTemplateService } from '@/lib/services/programTemplateService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalTemplates: number;
  activePrograms: number;
  archivedPrograms: number;
}

export default function ProgramsDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTemplates: 0,
    activePrograms: 0,
    archivedPrograms: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const { templates } = await programTemplateService.listTemplates();
      
      // Validate templates data
      if (!Array.isArray(templates)) {
        throw new Error('Invalid templates data received');
      }

      setStats(prev => ({
        ...prev,
        totalTemplates: templates.length
      }));
    } catch (error) {
      console.error('Error loading stats:', error);
      setError('Failed to load program statistics');
      toast.error('Failed to load program statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (href: string) => {
    try {
      router.push(href);
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Failed to navigate to the requested page');
    }
  };

  const cards = [
    {
      name: 'Program Templates',
      stat: stats.totalTemplates,
      description: 'Create and manage program templates',
      href: '/coach/programs/templates',
      color: 'bg-blue-500'
    },
    {
      name: 'Active Programs',
      stat: stats.activePrograms,
      description: 'View and manage active client programs',
      href: '/coach/programs/active',
      color: 'bg-green-500'
    },
    {
      name: 'Archived Programs',
      stat: stats.archivedPrograms,
      description: 'Access completed and archived programs',
      href: '/coach/programs/archived',
      color: 'bg-gray-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={loadStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Programs Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage your coaching programs and templates
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <button
              key={card.name}
              onClick={() => handleNavigation(card.href)}
              className="relative block w-full rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:ring-1 hover:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className={`absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 rounded-full ${card.color}`} />
              <dt>
                <p className="text-2xl font-semibold text-gray-900">{card.stat}</p>
                <p className="mt-2 text-lg font-medium text-gray-900">{card.name}</p>
                <p className="mt-1 text-sm text-gray-500">{card.description}</p>
              </dt>
            </button>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => handleNavigation('/coach/programs/templates/new')}
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create New Template
            </button>
            <button
              onClick={() => handleNavigation('/coach/programs/active/new')}
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Assign Program to Client
            </button>
            <button
              onClick={() => handleNavigation('/coach/resources')}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Manage Resources
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
} 