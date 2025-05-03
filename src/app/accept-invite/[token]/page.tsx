'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { clientService } from '@/lib/services/clientService';
import { ClientInvite } from '@/types/client';

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams();
  const [invite, setInvite] = useState<ClientInvite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const verifyInvite = async () => {
      try {
        const token = params.token as string;
        const inviteData = await clientService.verifyInvite(token);
        if (!inviteData) {
          toast.error('Invalid or expired invitation');
          router.push('/auth/login');
          return;
        }
        setInvite(inviteData);
      } catch (error) {
        console.error('Error verifying invite:', error);
        toast.error('Failed to verify invitation');
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyInvite();
  }, [params.token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const token = params.token as string;
      const success = await clientService.acceptInvite(token);
      
      if (success) {
        toast.success('Account created successfully!');
        router.push('/auth/login');
      } else {
        toast.error('Failed to create account');
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast.error('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!invite) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            Welcome to {invite.clientProfile.coachName}'s Coaching Program
          </h2>
          <p className="mt-2 text-gray-400">
            Create your account to get started
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={invite.clientProfile.email}
                disabled
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                required
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading
                  ? 'bg-blue-500/50 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 