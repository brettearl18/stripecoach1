'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/auth';
import { toast } from 'react-hot-toast';

// Session timeout settings
const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000; // 5 minutes before timeout
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

interface SessionContextType {
  timeRemaining: number;
  showWarning: boolean;
  extendSession: () => void;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number>(TIMEOUT_DURATION);
  const [showWarning, setShowWarning] = useState<boolean>(false);

  // Handle user activity
  const handleActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  // Extend session
  const extendSession = useCallback(() => {
    handleActivity();
    toast.success('Session extended');
  }, [handleActivity]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await auth.signOut();
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  }, [router]);

  // Set up activity listeners
  useEffect(() => {
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [handleActivity]);

  // Check session timeout
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      const remainingTime = TIMEOUT_DURATION - timeSinceLastActivity;

      setTimeRemaining(remainingTime);

      if (remainingTime <= WARNING_BEFORE_TIMEOUT && remainingTime > 0) {
        setShowWarning(true);
      }

      if (remainingTime <= 0) {
        logout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity, logout]);

  return (
    <SessionContext.Provider
      value={{
        timeRemaining,
        showWarning,
        extendSession,
        logout,
      }}
    >
      {children}
      {showWarning && <SessionWarning />}
    </SessionContext.Provider>
  );
}

// Session warning component
function SessionWarning() {
  const session = useSession();
  const minutes = Math.ceil(session.timeRemaining / 1000 / 60);

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-900/90 text-yellow-100 p-4 rounded-lg shadow-lg z-50">
      <div className="flex flex-col space-y-3">
        <p className="text-sm">
          Your session will expire in {minutes} minute{minutes !== 1 ? 's' : ''}.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={session.extendSession}
            className="px-3 py-1 bg-yellow-700 hover:bg-yellow-600 rounded text-sm"
          >
            Keep me signed in
          </button>
          <button
            onClick={session.logout}
            className="px-3 py-1 bg-yellow-800 hover:bg-yellow-700 rounded text-sm"
          >
            Logout now
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to use session context
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
} 