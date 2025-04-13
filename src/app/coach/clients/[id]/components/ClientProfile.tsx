import { useState } from 'react';
import { SCORING_TIERS, type ScoringTier } from '../../../templates-v2/services/scoringService';

interface ClientProfileProps {
  client: {
    id: string;
    name: string;
    email: string;
    scoringTierId?: string;
    // ... other client fields
  };
  onUpdate: (updates: Partial<ClientProfileProps['client']>) => Promise<void>;
}

export default function ClientProfile({ client, onUpdate }: ClientProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const selectedTier = SCORING_TIERS.find(tier => tier.id === client.scoringTierId) || SCORING_TIERS[3]; // Default to Beginner

  const handleTierChange = async (tierId: string) => {
    await onUpdate({ scoringTierId: tierId });
  };

  return (
    <div className="bg-[#1C1C1F] rounded-lg p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">{client.name}</h2>
          <p className="text-gray-400">{client.email}</p>
        </div>
        {/* ... other profile actions ... */}
      </div>

      {/* Scoring Tier Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Scoring Level</h3>
        <p className="text-sm text-gray-400">
          Set the scoring thresholds for this client based on their experience level.
        </p>
        
        <div className="grid gap-4">
          {SCORING_TIERS.map((tier) => (
            <label
              key={tier.id}
              className={`relative flex items-start p-4 cursor-pointer rounded-lg border ${
                selectedTier.id === tier.id
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="scoring-tier"
                    value={tier.id}
                    checked={selectedTier.id === tier.id}
                    onChange={() => handleTierChange(tier.id)}
                    className="h-4 w-4 border-gray-700 text-indigo-600 focus:ring-indigo-600 bg-[#2C2C30]"
                  />
                  <span className="font-medium text-white">{tier.name}</span>
                </div>
                <p className="mt-1 text-sm text-gray-400">{tier.description}</p>
                <div className="mt-2 text-sm">
                  <span className="text-red-400">Red: Below {tier.thresholds.red * 100}%</span>
                  <span className="mx-2 text-gray-600">|</span>
                  <span className="text-orange-400">Orange: {tier.thresholds.red * 100}% - {tier.thresholds.orange * 100}%</span>
                  <span className="mx-2 text-gray-600">|</span>
                  <span className="text-green-400">Green: Above {tier.thresholds.orange * 100}%</span>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
} 