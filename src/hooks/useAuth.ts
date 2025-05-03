import { useState, useEffect, useMemo } from 'react';
import { auth } from '@/lib/firebase/firebase-client';
import { authService } from '@/lib/services/authService';
import { User } from 'firebase/auth';

export interface AuthState {
  user: User | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  // DEV MODE: Always return a memoized fake user with the 'coach' role
  const user = useMemo(() => ({ uid: 'dev-user', email: 'dev@dev.com' }), []);
  return {
    user,
    role: 'coach', // Change to 'admin' or 'client' to test other dashboards
    loading: false,
    signOut: async () => {},
  };
} 