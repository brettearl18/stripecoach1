import React from 'react';

// Mock data for sentiment highlights
const winningStatements = [
  { text: "I hit my nutrition goal every day!", client: "Sarah J.", week: 12 },
  { text: "Best week yet!", client: "Emma W.", week: 8 },
  { text: "Feeling stronger than ever!", client: "John D.", week: 15 },
];

const cautiousStatements = [
  { text: "Struggling to stay motivated.", client: "Michael C.", week: 20 },
  { text: "Missed 2 workouts this week.", client: "Lisa T.", week: 4 },
  { text: "Need to improve sleep habits.", client: "Alex R.", week: 10 },
];

const SentimentHighlights: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Sentiment Highlights</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Winning Statements</h3>
          <ul className="space-y-2">
            {winningStatements.map((statement, index) => (
              <li key={index} className="p-2 bg-green-50 rounded">
                <p className="font-medium">{statement.text}</p>
                <p className="text-sm text-gray-600">{statement.client} - Week {statement.week}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Cautious Statements</h3>
          <ul className="space-y-2">
            {cautiousStatements.map((statement, index) => (
              <li key={index} className="p-2 bg-yellow-50 rounded">
                <p className="font-medium">{statement.text}</p>
                <p className="text-sm text-gray-600">{statement.client} - Week {statement.week}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SentimentHighlights; 