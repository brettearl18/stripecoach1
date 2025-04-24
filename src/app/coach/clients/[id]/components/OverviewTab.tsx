'use client';

import { format } from 'date-fns';
import {
  SparklesIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import ClientSettings from './ClientSettings';
import { clientService } from '@/lib/services/clientService';

interface TabContentProps {
  client: any;
}

export default function OverviewTab({ client }: TabContentProps) {
  return (
    <div className="space-y-6">
      {/* Client Settings */}
      <ClientSettings 
        client={client}
        onUpdate={async (updates) => {
          try {
            await clientService.updateClient(client.id, updates);
            // You might want to refresh the client data here
          } catch (error) {
            console.error('Failed to update client:', error);
          }
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Progress & Metrics */}
        <div className="col-span-2 space-y-6">
          {/* Progress Overview */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Progress Overview</h2>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(client.weeklyProgress || {}).map(([area, progress]) => (
                  <div key={area} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-400 capitalize">{area}</div>
                    <div className="mt-2">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="h-2 bg-gray-600 rounded-full">
                            <div
                              className="h-2 bg-blue-500 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-white">
                          {progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Check-ins */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Recent Check-ins</h2>
              <div className="space-y-4">
                {client.checkIns?.slice(0, 3).map((checkIn: any) => (
                  <div key={checkIn.id} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-white">
                            {new Date(checkIn.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-400">{checkIn.notes}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        checkIn.status === 'completed'
                          ? 'bg-green-900/20 text-green-400 border border-green-800/20'
                          : 'bg-yellow-900/20 text-yellow-400 border border-yellow-800/20'
                      }`}>
                        {checkIn.status}
                      </span>
                    </div>
                    {checkIn.metrics && (
                      <div className="mt-3 grid grid-cols-3 gap-4">
                        {Object.entries(checkIn.metrics).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="text-gray-400 capitalize">{key}: </span>
                            <span className="text-white font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - AI Insights & Actions */}
        <div className="space-y-6">
          {/* AI Summary */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">AI Insights</h2>
                <SparklesIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="prose prose-sm dark:prose-invert">
                <p className="text-gray-300">{client.aiSummary?.overview}</p>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-white flex items-center">
                    <TrophyIcon className="h-4 w-4 text-green-400 mr-2" />
                    Recent Wins
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {client.aiSummary?.wins.map((win: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{win}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-white flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mr-2" />
                    Areas for Attention
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {client.aiSummary?.challenges.map((challenge: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <ClockIcon className="h-4 w-4 text-yellow-400 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-white flex items-center">
                    <SparklesIcon className="h-4 w-4 text-blue-400 mr-2" />
                    Recommendations
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {client.aiSummary?.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <ArrowTrendingUpIcon className="h-4 w-4 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-white">Schedule Check-in</span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-white">Send Message</span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-white">Update Goals</span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 