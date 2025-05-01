import { getDatabase, ref, set, serverTimestamp, get } from 'firebase/database';
import { auth } from '@/lib/firebase/auth';
import { UAParser } from 'ua-parser-js';
import { QueryOptimizer } from './queryOptimizer';
import { Session } from '@/types/session';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const HEARTBEAT_INTERVAL = 60 * 1000; // 1 minute

interface SessionData {
  sessionId: string;
  deviceType: string;
  browser: string;
  location: string;
  lastActive: any; // Firebase ServerValue.TIMESTAMP
  createdAt: any; // Firebase ServerValue.TIMESTAMP
  expiresAt: any;
  status: 'active' | 'expired' | 'terminated';
}

let heartbeatInterval: NodeJS.Timeout;
let cleanupInterval: NodeJS.Timeout;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const startHeartbeat = (sessionId: string) => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  heartbeatInterval = setInterval(async () => {
    try {
      await updateSessionActivity();
    } catch (error) {
      console.error('Heartbeat failed:', error);
      handleConnectionError();
    }
  }, HEARTBEAT_INTERVAL);
};

const handleConnectionError = async () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Max reconnection attempts reached');
    await cleanupSession();
    return;
  }

  reconnectAttempts++;
  try {
    const sessionId = await initSession();
    if (sessionId) {
      reconnectAttempts = 0;
      startHeartbeat(sessionId);
    }
  } catch (error) {
    console.error('Reconnection attempt failed:', error);
    setTimeout(handleConnectionError, Math.pow(2, reconnectAttempts) * 1000);
  }
};

const startCleanup = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }

  cleanupInterval = setInterval(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const db = getDatabase();
      const sessionsRef = ref(db, `users/${user.uid}/sessions`);
      const now = Date.now();

      // Get all sessions
      const snapshot = await get(sessionsRef);
      const sessions = snapshot.val() || {};

      // Clean up expired sessions
      Object.entries(sessions).forEach(async ([sessionId, session]: [string, any]) => {
        if (now - session.lastActive > SESSION_TIMEOUT) {
          await set(ref(db, `users/${user.uid}/sessions/${sessionId}`), {
            ...session,
            status: 'expired'
          });
        }
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, CLEANUP_INTERVAL);
};

// Generate a unique session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Get device and browser information
const getDeviceInfo = () => {
  const parser = new UAParser();
  const result = parser.getResult();

  return {
    deviceType: result.device.type || 'desktop',
    browser: `${result.browser.name} ${result.browser.version}`,
  };
};

// Initialize a new session
export const initSession = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const sessionId = generateSessionId();
    const { deviceType, browser } = getDeviceInfo();
    const expiresAt = new Date(Date.now() + SESSION_TIMEOUT);

    const sessionData: SessionData = {
      sessionId,
      deviceType,
      browser,
      location: 'Unknown',
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp(),
      expiresAt: expiresAt.toISOString(),
      status: 'active'
    };

    const db = getDatabase();
    await set(ref(db, `users/${user.uid}/sessions/${sessionId}`), sessionData);
    localStorage.setItem('currentSessionId', sessionId);

    startHeartbeat(sessionId);
    startCleanup();

    return sessionId;
  } catch (error) {
    console.error('Error initializing session:', error);
    return null;
  }
};

// Update session activity
export const updateSessionActivity = async () => {
  const user = auth.currentUser;
  const sessionId = localStorage.getItem('currentSessionId');

  if (!user || !sessionId) return;

  try {
    const db = getDatabase();
    await set(ref(db, `users/${user.uid}/sessions/${sessionId}/lastActive`), serverTimestamp());
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
};

// Clean up session on logout
export const cleanupSession = async () => {
  const user = auth.currentUser;
  const sessionId = localStorage.getItem('currentSessionId');

  if (!user || !sessionId) return;

  try {
    const db = getDatabase();
    await set(ref(db, `users/${user.uid}/sessions/${sessionId}`), {
      status: 'terminated',
      lastActive: serverTimestamp()
    });
    
    localStorage.removeItem('currentSessionId');
    
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
    }
  } catch (error) {
    console.error('Error cleaning up session:', error);
  }
};

// Initialize session tracking
export const initializeSessionTracking = () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      initSession();
    } else {
      cleanupSession();
    }
  });
};

const sessionOptimizer = new QueryOptimizer('sessions');

export const sessionService = {
  async getSessions(clientId: string, options: { status?: string; startDate?: Date; endDate?: Date } = {}): Promise<Session[]> {
    const filters = [
      { field: 'clientId', operator: '==', value: clientId }
    ];

    if (options.status) {
      filters.push({ field: 'status', operator: '==', value: options.status });
    }

    if (options.startDate) {
      filters.push({ 
        field: 'scheduledAt', 
        operator: '>=', 
        value: options.startDate 
      });
    }

    if (options.endDate) {
      filters.push({ 
        field: 'scheduledAt', 
        operator: '<=', 
        value: options.endDate 
      });
    }

    try {
      const { data } = await sessionOptimizer.executeQuery({
        filters,
        pagination: {
          pageSize: 50,
          orderByField: 'scheduledAt',
          orderDirection: 'desc'
        }
      });
      
      return data as Session[];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  async getSessionById(sessionId: string): Promise<Session | null> {
    try {
      const { data } = await sessionOptimizer.executeQuery({
        filters: [{ field: 'id', operator: '==', value: sessionId }],
        pagination: { pageSize: 1 }
      });
      
      return data[0] as Session || null;
    } catch (error) {
      console.error('Error fetching session:', error);
      throw error;
    }
  },

  async getUpcomingSessions(coachId: string, limit: number = 5): Promise<Session[]> {
    const now = new Date();
    try {
      const { data } = await sessionOptimizer.executeQuery({
        filters: [
          { field: 'coachId', operator: '==', value: coachId },
          { field: 'scheduledAt', operator: '>=', value: now },
          { field: 'status', operator: '==', value: 'scheduled' }
        ],
        pagination: {
          pageSize: limit,
          orderByField: 'scheduledAt',
          orderDirection: 'asc'
        }
      });
      
      return data as Session[];
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      throw error;
    }
  },

  clearCache() {
    sessionOptimizer.clearCache();
  }
}; 