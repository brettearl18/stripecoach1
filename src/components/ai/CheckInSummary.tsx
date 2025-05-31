import React, { useEffect } from 'react';
import { AIResponse } from '@/components/AIResponse';
import { useAIService } from '@/hooks/useAIService';
import { CheckInData } from '@/types';

interface CheckInSummaryProps {
  checkInData: CheckInData;
  onSummaryGenerated?: (summary: string) => void;
}

export const CheckInSummary: React.FC<CheckInSummaryProps> = ({
  checkInData,
  onSummaryGenerated,
}) => {
  const {
    data: summary,
    isLoading,
    error,
    execute,
  } = useAIService<string>();

  useEffect(() => {
    const generateSummary = async () => {
      await execute(
        `checkin-summary-${checkInData.id}`,
        async () => {
          const response = await fetch('/api/ai/summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkInData }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate summary');
          }

          const data = await response.json();
          return data.summary;
        }
      );
    };

    generateSummary();
  }, [checkInData, execute]);

  useEffect(() => {
    if (summary && onSummaryGenerated) {
      onSummaryGenerated(summary);
    }
  }, [summary, onSummaryGenerated]);

  return (
    <AIResponse
      content={summary}
      isLoading={isLoading}
      error={error}
      title="Check-in Summary"
    />
  );
}; 