'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  getFormSubmissions,
  getClientAnalytics,
  getAISuggestions,
  type FormSubmission,
  type ClientAnalytics,
  type AICoachingSuggestion,
  type Client,
  getClients
} from '@/lib/services/firebaseService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ClientDetail() {
  const params = useParams();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [analytics, setAnalytics] = useState<ClientAnalytics | null>(null);
  const [suggestions, setSuggestions] = useState<AICoachingSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClientData = async () => {
      try {
        setIsLoading(true);
        
        // Load client details
        const clients = await getClients();
        const clientData = clients.find(c => c.id === clientId);
        if (clientData) {
          setClient(clientData);
        }

        // Load submissions
        const submissionsData = await getFormSubmissions(undefined, clientId);
        setSubmissions(submissionsData.sort((a, b) => 
          b.submittedAt.getTime() - a.submittedAt.getTime()
        ));

        // Load analytics
        const analyticsData = await getClientAnalytics(clientId);
        setAnalytics(analyticsData);

        // Load AI suggestions
        const suggestionsData = await getAISuggestions(clientId);
        setSuggestions(suggestionsData);

      } catch (error) {
        console.error('Error loading client data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClientData();
  }, [clientId]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F15] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading client data...
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-[#0B0F15] flex items-center justify-center text-white">
        Client not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F15] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-gray-400">{client.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analytics Overview */}
          <div className="bg-[#1A1F2B] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
            {analytics ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Total Submissions</div>
                  <div className="text-2xl font-semibold">{analytics.submissions}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Average Completion Time</div>
                  <div className="text-2xl font-semibold">
                    {Math.round(analytics.averageCompletionTime / 60)} min
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Completion Rate</div>
                  <div className="text-2xl font-semibold">
                    {Math.round(analytics.completionRate * 100)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Consistency Score</div>
                  <div className="text-2xl font-semibold">
                    {analytics.consistencyScore}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">No analytics available</div>
            )}
          </div>

          {/* Latest AI Suggestions */}
          <div className="bg-[#1A1F2B] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Latest AI Suggestions</h2>
            {suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions[0].suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-[#2A303C] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{suggestion.category}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        suggestion.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                        suggestion.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-green-500/10 text-green-400'
                      }`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{suggestion.suggestion}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">No suggestions available</div>
            )}
          </div>

          {/* Goals and Preferences */}
          <div className="bg-[#1A1F2B] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Goals & Preferences</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-2">Goals</div>
                <div className="space-y-1">
                  {Array.isArray(client.goals) ? (
                    client.goals.map((goal, index) => (
                      <div key={index} className="bg-[#2A303C] text-sm rounded-lg px-3 py-2">
                        {goal}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No goals set</div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Focus Areas</div>
                <div className="flex flex-wrap gap-2">
                  {client.preferences?.focusAreas?.map((area, index) => (
                    <span key={index} className="bg-blue-500/10 text-blue-400 text-sm rounded-lg px-3 py-1">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Check-in History */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Check-in History</h2>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="bg-[#1A1F2B] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-400">{formatDate(submission.submittedAt)}</div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-gray-400">Completion Time: </span>
                      <span className="text-blue-400">{Math.round(submission.metrics.completionTime / 60)} min</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Questions: </span>
                      <span className="text-blue-400">
                        {submission.metrics.questionsAnswered} / {submission.metrics.requiredQuestionsAnswered}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(submission.answers).map(([questionId, answer]) => (
                    <div key={questionId} className="bg-[#2A303C] rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-2">Question {questionId}</div>
                      <div className="text-sm">{answer.toString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 