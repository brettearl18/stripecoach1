'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/auth';
import { getDatabase, ref, onValue, remove, set } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { DeviceIcon, ComputerDesktopIcon, PhoneIcon as DeviceMobileIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface Session {
  id: string;
  deviceType: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const db = getDatabase();
    const sessionsRef = ref(db, `users/${user.uid}/sessions`);

    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sessionList = Object.entries(data).map(([id, session]: [string, any]) => ({
          id,
          ...session,
          isCurrent: session.sessionId === localStorage.getItem('currentSessionId'),
        }));
        setSessions(sessionList);
      } else {
        setSessions([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const db = getDatabase();
      await remove(ref(db, `users/${user.uid}/sessions/${sessionId}`));
      toast.success('Session terminated successfully');
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error('Failed to terminate session');
    }
  };

  const handleTerminateAllOtherSessions = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const currentSessionId = localStorage.getItem('currentSessionId');
      const db = getDatabase();
      const sessionsRef = ref(db, `users/${user.uid}/sessions`);

      // Keep only the current session
      const updates = {};
      sessions.forEach((session) => {
        if (session.id !== currentSessionId) {
          updates[session.id] = null;
        }
      });

      await set(sessionsRef, updates);
      toast.success('All other sessions terminated');
    } catch (error) {
      console.error('Error terminating sessions:', error);
      toast.error('Failed to terminate sessions');
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <DeviceMobileIcon className="w-6 h-6" />;
      case 'desktop':
        return <ComputerDesktopIcon className="w-6 h-6" />;
      default:
        return <GlobeAltIcon className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Active Sessions</h1>
          {sessions.length > 1 && (
            <button
              onClick={handleTerminateAllOtherSessions}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
            >
              Terminate All Other Sessions
            </button>
          )}
        </div>

        <div className="grid gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="text-gray-400">
                  {getDeviceIcon(session.deviceType)}
                </div>
                <div>
                  <div className="text-white font-medium">
                    {session.browser} on {session.deviceType}
                    {session.isCurrent && (
                      <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                        Current Session
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    <span className="mr-4">Location: {session.location}</span>
                    <span>Last active: {new Date(session.lastActive).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {!session.isCurrent && (
                <button
                  onClick={() => handleTerminateSession(session.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Terminate
                </button>
              )}
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No active sessions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 