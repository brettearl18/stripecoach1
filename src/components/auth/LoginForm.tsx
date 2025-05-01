'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getTwoFactorStatus } from '@/lib/services/twoFactorService';
import TwoFactorVerify from './TwoFactorVerify';

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [userId, setUserId] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user has 2FA enabled
      const twoFactorStatus = await getTwoFactorStatus(user.uid);
      
      if (twoFactorStatus.isEnabled) {
        // Show 2FA verification
        setUserId(user.uid);
        setShowTwoFactor(true);
      } else {
        // No 2FA, proceed with login
        handleLoginSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    toast({
      title: 'Success',
      description: 'Signed in successfully',
    });
    router.push('/dashboard');
  };

  const handleTwoFactorCancel = () => {
    // Sign out the user since 2FA was cancelled
    auth.signOut();
    setShowTwoFactor(false);
    setUserId('');
  };

  if (showTwoFactor) {
    return (
      <TwoFactorVerify
        userId={userId}
        onVerify={handleLoginSuccess}
        onCancel={handleTwoFactorCancel}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 