import React, { useState, useEffect } from 'react';
import { SCORING_TIERS } from '../../../templates-v2/services/scoringService';
import { auditService } from '@/lib/services/auditService';
import { format } from 'date-fns';

interface ClientSettingsProps {
  client: {
    id: string;
    name: string;
    email: string;
    scoringTierId?: string;
  };
  onUpdate: (updates: Partial<ClientSettingsProps['client']>) => Promise<void>;
}

interface AuditLogEntry {
  action: string;
  performedBy: string;
  timestamp: Date;
  details: any;
}

export default function ClientSettings({ client, onUpdate }: ClientSettingsProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'audit'>('settings');

  // Fetch audit logs for this client
  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const logs = await auditService.getClientLogs(client.id);
        setAuditLogs(logs);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      }
      setLoading(false);
    };

    fetchAuditLogs();
  }, [client.id]);

  const handleTierChange = async (tierId: string) => {
    try {
      await onUpdate({ scoringTierId: tierId });
    } catch (error) {
      console.error('Failed to update scoring tier:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Client Settings
        </h2>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('settings')}
              className={`${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Scoring Settings
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`${
                activeTab === 'audit'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Audit Log
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Scoring Tier
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select the appropriate scoring tier for this client. This will affect how their progress is evaluated.
              </p>
              <div className="space-y-4">
                {SCORING_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    className="relative flex items-start py-4 border-2 rounded-lg px-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => handleTierChange(tier.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {tier.name}
                      </div>
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {tier.description}
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="text-green-600 dark:text-green-400">
                          Green: {tier.thresholds.green}%+
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-orange-600 dark:text-orange-400">
                          Orange: {tier.thresholds.orange}%-{tier.thresholds.green}%
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-red-600 dark:text-red-400">
                          Red: &lt;{tier.thresholds.red}%
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex h-6 items-center">
                      <input
                        type="radio"
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        checked={client.scoringTierId === tier.id}
                        onChange={() => handleTierChange(tier.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audit Log Content */}
        {activeTab === 'audit' && (
          <div>
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No changes recorded yet
                  </div>
                ) : (
                  auditLogs.map((log, idx) => (
                    <li key={idx}>
                      <div className="relative pb-8">
                        {idx !== auditLogs.length - 1 && (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                              <svg
                                className="h-5 w-5 text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path
                                  fillRule="evenodd"
                                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {log.action === 'SCORING_TIER_CHANGE'
                                  ? `Scoring tier changed from ${log.details.oldTier || 'none'} to ${log.details.newTier}`
                                  : 'Settings updated'}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                By {log.performedBy}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                              {format(log.timestamp, 'MMM d, yyyy HH:mm')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 