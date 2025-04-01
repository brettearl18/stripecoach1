import { db } from '@/lib/firebase/config';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const INTEGRATIONS_COLLECTION = 'integrations';

// Mock data for development
let MOCK_INTEGRATIONS: Record<string, IntegrationConfig> = {
  'google_calendar_default-coach-id': {
    id: 'google_calendar_default-coach-id',
    coachId: 'default-coach-id',
    provider: 'google_calendar',
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token',
    scope: ['calendar.readonly', 'calendar.events'],
    connected: true,
    lastSync: new Date(),
    settings: {
      syncEnabled: true,
      calendarId: 'primary'
    }
  },
  'zoom_default-coach-id': {
    id: 'zoom_default-coach-id',
    coachId: 'default-coach-id',
    provider: 'zoom',
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token',
    scope: ['meeting:write', 'user:read'],
    connected: false,
    settings: {
      autoCreateMeetings: true,
      defaultDuration: 60
    }
  },
  'loom_default-coach-id': {
    id: 'loom_default-coach-id',
    coachId: 'default-coach-id',
    provider: 'loom',
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token',
    scope: ['videos.read', 'videos.write'],
    connected: false,
    settings: {
      autoShare: true,
      workspace: 'default'
    }
  }
};

interface IntegrationConfig {
  id: string;
  coachId: string;
  provider: 'google_calendar' | 'zoom' | 'loom';
  accessToken: string;
  refreshToken: string;
  scope: string[];
  connected: boolean;
  lastSync?: Date;
  settings?: Record<string, any>;
}

// Helper function to handle operations with mock/real data support
async function handleIntegrationOperation<T>(
  operation: () => Promise<T>,
  mockOperation: () => Promise<T>
): Promise<T> {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Simulate network delay in development
      await new Promise(resolve => setTimeout(resolve, 500));
      return await mockOperation();
    }
    return await operation();
  } catch (error: any) {
    if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
      console.warn('Operation failed due to offline state:', error);
      throw new Error('You are currently offline. Please check your internet connection and try again.');
    }
    throw error;
  }
}

// Get integration status
export async function getIntegrationStatus(
  coachId: string,
  provider: IntegrationConfig['provider']
): Promise<IntegrationConfig | null> {
  return handleIntegrationOperation(
    async () => {
      const docRef = doc(db, INTEGRATIONS_COLLECTION, `${provider}_${coachId}`);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as IntegrationConfig : null;
    },
    async () => {
      const mockId = `${provider}_${coachId}`;
      return MOCK_INTEGRATIONS[mockId] || null;
    }
  );
}

// Connect integration
export async function connectIntegration(
  coachId: string,
  provider: IntegrationConfig['provider']
): Promise<IntegrationConfig> {
  return handleIntegrationOperation(
    async () => {
      const integration: IntegrationConfig = {
        id: `${provider}_${coachId}`,
        coachId,
        provider,
        accessToken: 'real_access_token',
        refreshToken: 'real_refresh_token',
        scope: getDefaultScope(provider),
        connected: true,
        lastSync: new Date(),
        settings: getDefaultSettings(provider)
      };
      
      const docRef = doc(db, INTEGRATIONS_COLLECTION, integration.id);
      await setDoc(docRef, integration);
      return integration;
    },
    async () => {
      const mockId = `${provider}_${coachId}`;
      const integration = MOCK_INTEGRATIONS[mockId];
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      // Create a new object to avoid mutating the original mock data
      MOCK_INTEGRATIONS[mockId] = {
        ...integration,
        connected: true,
        lastSync: new Date()
      };
      
      return MOCK_INTEGRATIONS[mockId];
    }
  );
}

// Disconnect integration
export async function disconnectIntegration(
  coachId: string,
  provider: IntegrationConfig['provider']
): Promise<void> {
  return handleIntegrationOperation(
    async () => {
      const docRef = doc(db, INTEGRATIONS_COLLECTION, `${provider}_${coachId}`);
      await deleteDoc(docRef);
    },
    async () => {
      const mockId = `${provider}_${coachId}`;
      const integration = MOCK_INTEGRATIONS[mockId];
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      // Create a new object to avoid mutating the original mock data
      MOCK_INTEGRATIONS[mockId] = {
        ...integration,
        connected: false,
        lastSync: undefined
      };
    }
  );
}

// Helper functions for default values
function getDefaultScope(provider: IntegrationConfig['provider']): string[] {
  switch (provider) {
    case 'google_calendar':
      return ['calendar.readonly', 'calendar.events'];
    case 'zoom':
      return ['meeting:write', 'user:read'];
    case 'loom':
      return ['videos.read', 'videos.write'];
  }
}

function getDefaultSettings(provider: IntegrationConfig['provider']): Record<string, any> {
  switch (provider) {
    case 'google_calendar':
      return { syncEnabled: true, calendarId: 'primary' };
    case 'zoom':
      return { autoCreateMeetings: true, defaultDuration: 60 };
    case 'loom':
      return { autoShare: true, workspace: 'default' };
  }
}

// Export convenience functions for specific integrations
export const connectGoogleCalendar = (coachId: string) => connectIntegration(coachId, 'google_calendar');
export const connectZoom = (coachId: string) => connectIntegration(coachId, 'zoom');
export const connectLoom = (coachId: string) => connectIntegration(coachId, 'loom'); 