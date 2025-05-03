import React from 'react';
import CategoryComparisonChart from '@/components/analytics/CategoryComparisonChart';
import SentimentHighlights from '@/components/analytics/SentimentHighlights';

const GroupAnalysisPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Group Analysis</h1>
      <div className="space-y-6">
        <CategoryComparisonChart />
        <SentimentHighlights />
      </div>
    </div>
  );
};

export default GroupAnalysisPage; 