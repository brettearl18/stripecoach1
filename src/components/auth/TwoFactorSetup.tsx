'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, ShieldOff, RefreshCw, Download } from 'lucide-react';
import {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  disableTwoFactor,
  getTwoFactorStatus,
  regenerateBackupCodes,
  generateBackupCodesFile,
  TwoFactorSecret,
  TwoFactorStatus,
} from '@/lib/services/twoFactorService';
import { useAuth } from '@/hooks/useAuth';

export default function TwoFactorSetup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<TwoFactorSecret | null>(null);
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [token, setToken] = useState('');
  const [disableToken, setDisableToken] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (user) {
      loadTwoFactorStatus();
    }
  }, [user]);

  const loadTwoFactorStatus = async () => {
    try {
      const status = await getTwoFactorStatus(user!.uid);
      setStatus(status);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load 2FA status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    try {
      setLoading(true);
      const data = await generateTwoFactorSecret(user!.uid, user!.email!);
      setSetupData(data);
      setShowBackupCodes(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to setup 2FA',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      const isValid = await verifyTwoFactorToken(user!.uid, token);
      
      if (isValid) {
        toast({
          title: 'Success',
          description: '2FA has been enabled successfully',
        });
        setSetupData(null);
        await loadTwoFactorStatus();
      } else {
        toast({
          title: 'Invalid Code',
          description: 'Please check the code and try again',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setToken('');
    }
  };

  const handleDisable = async () => {
    try {
      setIsDisabling(true);
      const success = await disableTwoFactor(user!.uid, disableToken);
      
      if (success) {
        toast({
          title: 'Success',
          description: '2FA has been disabled',
        });
        await loadTwoFactorStatus();
      } else {
        toast({
          title: 'Invalid Code',
          description: 'Please check the code and try again',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to disable 2FA',
        variant: 'destructive',
      });
    } finally {
      setIsDisabling(false);
      setDisableToken('');
    }
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      setIsRegenerating(true);
      const newBackupCodes = await regenerateBackupCodes(user!.uid, token);
      
      toast({
        title: 'Success',
        description: 'Backup codes have been regenerated',
      });
      
      setStatus(prev => prev ? { ...prev, backupCodes: newBackupCodes } : null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to regenerate backup codes',
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    if (!status?.backupCodes) return;
    
    const content = generateBackupCodesFile(status.backupCodes);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stripe-coach-2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!status?.isEnabled && !setupData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by enabling two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSetup}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Setup 2FA
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (setupData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Setup Two-Factor Authentication</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app and enter the code to enable 2FA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Image
              src={setupData.qrCode}
              alt="2FA QR Code"
              width={200}
              height={200}
            />
          </div>
          
          <Alert>
            <AlertTitle>Manual Setup</AlertTitle>
            <AlertDescription className="mt-2 font-mono text-sm">
              {setupData.secret}
            </AlertDescription>
          </Alert>

          {showBackupCodes && status?.backupCodes && (
            <Alert>
              <AlertTitle className="flex items-center justify-between">
                Backup Codes
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadBackupCodes}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Codes
                </Button>
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2">Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.</p>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {status.backupCodes.map((code, index) => (
                    <div key={index} className="p-2 bg-muted rounded">
                      {code}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              maxLength={6}
            />
            <Button
              onClick={handleVerify}
              disabled={token.length !== 6 || loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Verify and Enable'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          2FA is currently enabled. Enter your code to disable it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Disabling 2FA will make your account less secure.
          </AlertDescription>
        </Alert>

        {status?.backupCodes && (
          <Alert>
            <AlertTitle className="flex items-center justify-between">
              Backup Codes
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadBackupCodes}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Codes
              </Button>
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">You have {status.backupCodes.length} backup codes remaining.</p>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {status.backupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-muted rounded">
                    {code}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleRegenerateBackupCodes}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Regenerate Backup Codes
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={disableToken}
            onChange={(e) => setDisableToken(e.target.value)}
            maxLength={6}
          />
          <Button
            onClick={handleDisable}
            disabled={disableToken.length !== 6 || isDisabling}
            variant="destructive"
            className="w-full"
          >
            {isDisabling ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShieldOff className="mr-2 h-4 w-4" />
                Disable 2FA
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 