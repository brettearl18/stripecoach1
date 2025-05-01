'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { verifyTwoFactorToken } from '@/lib/services/twoFactorService';

interface TwoFactorVerifyProps {
  userId: string;
  onVerify: () => void;
  onCancel: () => void;
}

export default function TwoFactorVerify({ userId, onVerify, onCancel }: TwoFactorVerifyProps) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError('');
      
      const isValid = await verifyTwoFactorToken(userId, token);
      
      if (isValid) {
        onVerify();
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            maxLength={6}
            className={error ? 'border-red-500' : ''}
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleVerify}
            disabled={token.length !== 6 || loading}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Verify'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 