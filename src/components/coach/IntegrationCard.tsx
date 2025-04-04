'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface IntegrationCardProps {
  coachId: string;
  provider: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function IntegrationCard({
  coachId,
  provider,
  title,
  description,
  icon: Icon,
  iconColor = 'text-blue-500'
}: IntegrationCardProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual integration logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnected(true);
    } catch (error) {
      console.error(`Error connecting to ${provider}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual disconnection logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnected(false);
    } catch (error) {
      console.error(`Error disconnecting from ${provider}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-[#0f1729] border border-[#2a3441]">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${iconColor}/10`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <Button
        onClick={isConnected ? handleDisconnect : handleConnect}
        variant={isConnected ? "outline" : "default"}
        disabled={isLoading}
        className={isConnected ? "bg-[#0f1729] border-[#2a3441] hover:bg-[#2a3441] hover:text-white" : ""}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : (
          isConnected ? "Disconnect" : "Connect"
        )}
      </Button>
    </div>
  );
} 