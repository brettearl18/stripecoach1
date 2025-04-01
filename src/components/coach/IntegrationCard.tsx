import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  getIntegrationStatus,
  connectGoogleCalendar,
  connectZoom,
  connectLoom,
  disconnectIntegration,
  type IntegrationConfig
} from '@/lib/services/integrationService';

interface IntegrationCardProps {
  coachId: string;
  provider: IntegrationConfig['provider'];
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
  const [status, setStatus] = useState<IntegrationConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrationStatus();
  }, [coachId, provider]);

  const loadIntegrationStatus = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const status = await getIntegrationStatus(coachId, provider);
      setStatus(status);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load integration status';
      console.error(`Error loading ${provider} status:`, error);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setError(null);
    setIsLoading(true);
    try {
      let integration;
      switch (provider) {
        case 'google_calendar':
          integration = await connectGoogleCalendar(coachId);
          break;
        case 'zoom':
          integration = await connectZoom(coachId);
          break;
        case 'loom':
          integration = await connectLoom(coachId);
          break;
      }
      
      setStatus(integration);
      toast.success(`Successfully connected to ${title}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to connect to ${title}`;
      console.error(`Error connecting to ${provider}:`, error);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await disconnectIntegration(coachId, provider);
      await loadIntegrationStatus(); // Reload the status after disconnecting
      toast.success(`Successfully disconnected from ${title}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to disconnect from ${title}`;
      console.error(`Error disconnecting from ${provider}:`, error);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-[#2a3441] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{title}</h3>
              {status?.connected && (
                <Badge className="bg-green-600">Connected</Badge>
              )}
            </div>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="bg-[#0f1729] border-[#2a3441] hover:bg-[#2a3441]"
          onClick={status?.connected ? handleDisconnect : handleConnect}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-white" />
              Loading...
            </span>
          ) : status?.connected ? 'Disconnect' : 'Connect'}
        </Button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      {status?.connected && !error && (
        <div className="text-sm text-gray-400">
          Last synced: {status.lastSync ? new Date(status.lastSync).toLocaleString() : 'Never'}
        </div>
      )}
    </div>
  );
} 