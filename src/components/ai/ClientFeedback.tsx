import React, { useEffect } from 'react';
import { AIResponse } from '@/components/AIResponse';
import { useAIService } from '@/hooks/useAIService';
import { ClientProfile, ProgramProgress } from '@/types';

interface ClientFeedbackProps {
  clientProfile: ClientProfile;
  progress: ProgramProgress;
  onFeedbackGenerated?: (feedback: string) => void;
}

export const ClientFeedback: React.FC<ClientFeedbackProps> = ({
  clientProfile,
  progress,
  onFeedbackGenerated,
}) => {
  const {
    data: feedback,
    isLoading,
    error,
    execute,
  } = useAIService<string>();

  useEffect(() => {
    const generateFeedback = async () => {
      await execute(
        `client-feedback-${clientProfile.id}-${progress.id}`,
        async () => {
          const response = await fetch('/api/ai/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientProfile, progress }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate feedback');
          }

          const data = await response.json();
          return data.feedback;
        }
      );
    };

    generateFeedback();
  }, [clientProfile, progress, execute]);

  useEffect(() => {
    if (feedback && onFeedbackGenerated) {
      onFeedbackGenerated(feedback);
    }
  }, [feedback, onFeedbackGenerated]);

  return (
    <AIResponse
      content={feedback}
      isLoading={isLoading}
      error={error}
      title="Client Feedback"
    />
  );
}; 