import React, { useEffect, useState } from 'react';
import { analyticsService } from '@/lib/services/database';
import { useAuth } from '@/hooks/useAuth';

interface SentimentData {
  text: string;
  client: string;
  week: number;
}

interface SentimentHighlightsData {
  winning: SentimentData[];
  cautious: SentimentData[];
}

const SentimentHighlights = () => {
  const { user } = useAuth();
  const [data, setData] = useState<SentimentHighlightsData>({ winning: [], cautious: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      try {
        const sentimentData = await analyticsService.getSentimentHighlights(user.uid);
        setData(sentimentData);
      } catch (error) {
        console.error('Error fetching sentiment highlights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="w-full bg-[#1A1A1A] rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Sentiment Highlights</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1A1A1A] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Sentiment Highlights</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-md font-medium mb-2">Winning Statements</h4>
          <ul className="space-y-2">
            {data.winning.map((item, index) => (
              <li key={index} className="p-2 bg-green-900/20 rounded">
                <p className="text-sm">{item.text}</p>
                <p className="text-xs text-gray-400 mt-1">Week {item.week}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-md font-medium mb-2">Cautious Statements</h4>
          <ul className="space-y-2">
            {data.cautious.map((item, index) => (
              <li key={index} className="p-2 bg-yellow-900/20 rounded">
                <p className="text-sm">{item.text}</p>
                <p className="text-xs text-gray-400 mt-1">Week {item.week}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SentimentHighlights; 