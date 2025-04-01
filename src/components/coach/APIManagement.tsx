import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  createAPIKey, 
  getAPIKeys, 
  deleteAPIKey,
  type APICredentials 
} from '@/lib/services/apiService';
import { 
  PlusIcon, 
  TrashIcon, 
  KeyIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface APIManagementProps {
  coachId: string;
}

export function APIManagement({ coachId }: APIManagementProps) {
  const [apiKeys, setApiKeys] = useState<APICredentials[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');

  useEffect(() => {
    loadAPIKeys();
  }, [coachId]);

  const loadAPIKeys = async () => {
    try {
      setIsLoading(true);
      const keys = await getAPIKeys(coachId);
      setApiKeys(keys);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      const newKey = await createAPIKey(coachId, {
        name: newKeyName,
        description: newKeyDescription,
        rateLimit: {
          requestsPerMinute: 60,
          requestsPerHour: 1000,
          requestsPerDay: 10000,
        },
        status: 'active',
        permissions: {
          read: true,
          write: true,
          delete: false,
          admin: false,
        },
      });

      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      setNewKeyDescription('');
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      await deleteAPIKey(keyId);
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecret(prev => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  if (isLoading) {
    return <div>Loading API keys...</div>;
  }

  return (
    <Card className="bg-[#1a2234] border-[#2a3441]">
      <CardHeader>
        <CardTitle>API Management</CardTitle>
        <CardDescription className="text-gray-400">
          Manage your API keys for integrating with external systems
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Create New API Key */}
          <div className="space-y-4 p-4 rounded-lg bg-[#0f1729] border border-[#2a3441]">
            <h3 className="text-sm font-medium">Create New API Key</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                  className="bg-[#0f1729] border-[#2a3441]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="keyDescription">Description</Label>
                <Input
                  id="keyDescription"
                  value={newKeyDescription}
                  onChange={(e) => setNewKeyDescription(e.target.value)}
                  placeholder="Describe what this key is used for"
                  className="bg-[#0f1729] border-[#2a3441]"
                />
              </div>
              <Button 
                onClick={handleCreateKey}
                disabled={!newKeyName}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>
          </div>

          {/* API Keys List */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Your API Keys</h3>
            {apiKeys.length === 0 ? (
              <p className="text-sm text-gray-400">No API keys found</p>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div 
                    key={key.id}
                    className="p-4 rounded-lg bg-[#0f1729] border border-[#2a3441]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-medium">{key.name}</h4>
                        {key.description && (
                          <p className="text-sm text-gray-400">{key.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey(key.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <KeyIcon className="h-4 w-4 text-gray-400" />
                        <code className="text-sm bg-[#2a3441] px-2 py-1 rounded">
                          {key.apiKey}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <KeyIcon className="h-4 w-4 text-gray-400" />
                        <code className="text-sm bg-[#2a3441] px-2 py-1 rounded">
                          {showSecret[key.id] ? key.secretKey : '••••••••••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecretVisibility(key.id)}
                          className="text-gray-400 hover:text-gray-300"
                        >
                          {showSecret[key.id] ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#2a3441]">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Rate Limit</p>
                          <p className="text-sm">
                            {key.rateLimit.requestsPerMinute}/min
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Status</p>
                          <p className="text-sm capitalize">{key.status}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Created</p>
                          <p className="text-sm">
                            {new Date(key.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 