import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  createAPIKey, 
  getAPIKeys, 
  getAPIKey, 
  updateAPIKey, 
  deleteAPIKey, 
  getAPIUsage, 
  getRateLimit 
} from '../apiService';
import { APICredentials, APIUsage, APIRateLimit } from '@/types/api';

// Mock Firebase Firestore
jest.mock('../../firebase/config', () => ({
  db: {}
}));

// Mock Firestore functions
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockGetDoc = jest.fn();
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockServerTimestamp = jest.fn(() => new Date());

jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  doc: (...args: any[]) => mockDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  serverTimestamp: () => mockServerTimestamp(),
  Timestamp: {
    fromDate: jest.fn(date => date)
  }
}));

describe('API Service', () => {
  const mockCoachId = 'coach123';
  const mockApiKeyId = 'apiKey123';
  const mockApiKeyData = {
    name: 'Test API Key',
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000
    },
    webhookUrl: 'https://example.com/webhook',
    status: 'active' as const,
    permissions: {
      read: true,
      write: true,
      delete: false,
      admin: false
    },
    allowedIPs: ['192.168.1.1'],
    description: 'Test API key for testing'
  };

  const mockApiCredentials: APICredentials = {
    id: mockApiKeyId,
    coachId: mockCoachId,
    ...mockApiKeyData,
    apiKey: 'sk_test_123',
    secretKey: 'sk_secret_123',
    createdAt: new Date(),
    lastUsed: new Date()
  };

  const mockApiUsage: APIUsage = {
    id: 'usage123',
    coachId: mockCoachId,
    apiKeyId: mockApiKeyId,
    timestamp: new Date(),
    endpoint: '/api/clients',
    method: 'GET',
    status: 200,
    responseTime: 150,
    ipAddress: '192.168.1.1'
  };

  const mockRateLimit: APIRateLimit = {
    id: 'rateLimit123',
    coachId: mockCoachId,
    apiKeyId: mockApiKeyId,
    currentUsage: {
      minute: 10,
      hour: 100,
      day: 1000
    },
    lastReset: {
      minute: new Date(),
      hour: new Date(),
      day: new Date()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock implementations
    mockCollection.mockReturnValue('mockCollection');
    mockDoc.mockReturnValue('mockDoc');
    mockWhere.mockReturnValue('mockWhere');
    mockQuery.mockReturnValue('mockQuery');
  });

  describe('createAPIKey', () => {
    it('should create a new API key with generated keys', async () => {
      const mockDocRef = { id: mockApiKeyId };
      mockAddDoc.mockResolvedValueOnce(mockDocRef);
      mockAddDoc.mockResolvedValueOnce({ id: 'rateLimit123' });

      const result = await createAPIKey(mockCoachId, mockApiKeyData);

      expect(result).toMatchObject({
        id: mockApiKeyId,
        coachId: mockCoachId,
        ...mockApiKeyData
      });
      expect(result.apiKey).toMatch(/^sk_[a-f0-9]{48}$/);
      expect(result.secretKey).toMatch(/^sk_secret_[a-f0-9]{64}$/);
      expect(mockAddDoc).toHaveBeenCalledTimes(2);
    });

    it('should handle errors when creating API key', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(createAPIKey(mockCoachId, mockApiKeyData)).rejects.toThrow('Firestore error');
    });
  });

  describe('getAPIKeys', () => {
    it('should return all API keys for a coach', async () => {
      const mockQuerySnapshot = {
        docs: [{ id: mockApiKeyId, data: () => mockApiCredentials }]
      };
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot);

      const result = await getAPIKeys(mockCoachId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockApiCredentials);
      expect(mockCollection).toHaveBeenCalledWith(db, 'apiKeys');
      expect(mockWhere).toHaveBeenCalledWith('coachId', '==', mockCoachId);
      expect(mockQuery).toHaveBeenCalledWith('mockCollection', 'mockWhere');
    });

    it('should return empty array if no API keys found', async () => {
      mockGetDocs.mockResolvedValueOnce({ docs: [] });

      const result = await getAPIKeys(mockCoachId);

      expect(result).toHaveLength(0);
    });
  });

  describe('getAPIKey', () => {
    it('should return a specific API key', async () => {
      const mockDocSnapshot = {
        exists: () => true,
        id: mockApiKeyId,
        data: () => mockApiCredentials
      };
      mockGetDoc.mockResolvedValueOnce(mockDocSnapshot);

      const result = await getAPIKey(mockApiKeyId);

      expect(result).toEqual(mockApiCredentials);
      expect(mockDoc).toHaveBeenCalledWith(db, 'apiKeys', mockApiKeyId);
    });

    it('should return null if API key not found', async () => {
      const mockDocSnapshot = {
        exists: () => false
      };
      mockGetDoc.mockResolvedValueOnce(mockDocSnapshot);

      const result = await getAPIKey(mockApiKeyId);

      expect(result).toBeNull();
    });
  });

  describe('updateAPIKey', () => {
    it('should update an API key', async () => {
      const updateData = { name: 'Updated API Key' };
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await updateAPIKey(mockApiKeyId, updateData);

      expect(mockDoc).toHaveBeenCalledWith(db, 'apiKeys', mockApiKeyId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mockDoc',
        expect.objectContaining({
          ...updateData,
          lastUsed: expect.any(Date)
        })
      );
    });

    it('should handle errors when updating API key', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Update failed'));

      await expect(updateAPIKey(mockApiKeyId, { name: 'Updated' })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteAPIKey', () => {
    it('should delete an API key', async () => {
      mockDeleteDoc.mockResolvedValueOnce(undefined);

      await deleteAPIKey(mockApiKeyId);

      expect(mockDoc).toHaveBeenCalledWith(db, 'apiKeys', mockApiKeyId);
      expect(mockDeleteDoc).toHaveBeenCalledWith('mockDoc');
    });

    it('should handle errors when deleting API key', async () => {
      mockDeleteDoc.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(deleteAPIKey(mockApiKeyId)).rejects.toThrow('Delete failed');
    });
  });

  describe('getAPIUsage', () => {
    it('should return API usage data', async () => {
      const mockQuerySnapshot = {
        docs: [{ id: 'usage123', data: () => mockApiUsage }]
      };
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot);

      const result = await getAPIUsage(mockCoachId, mockApiKeyId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockApiUsage);
      expect(mockCollection).toHaveBeenCalledWith(db, 'apiUsage');
      expect(mockWhere).toHaveBeenCalledWith('coachId', '==', mockCoachId);
      expect(mockWhere).toHaveBeenCalledWith('apiKeyId', '==', mockApiKeyId);
      expect(mockQuery).toHaveBeenCalledWith('mockCollection', 'mockWhere', 'mockWhere');
    });

    it('should return empty array if no usage data found', async () => {
      mockGetDocs.mockResolvedValueOnce({ docs: [] });

      const result = await getAPIUsage(mockCoachId, mockApiKeyId);

      expect(result).toHaveLength(0);
    });
  });

  describe('getRateLimit', () => {
    it('should return rate limit data', async () => {
      const mockQuerySnapshot = {
        empty: false,
        docs: [{ id: 'rateLimit123', data: () => mockRateLimit }]
      };
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot);

      const result = await getRateLimit(mockCoachId, mockApiKeyId);

      expect(result).toEqual(mockRateLimit);
      expect(mockCollection).toHaveBeenCalledWith(db, 'apiRateLimits');
      expect(mockWhere).toHaveBeenCalledWith('coachId', '==', mockCoachId);
      expect(mockWhere).toHaveBeenCalledWith('apiKeyId', '==', mockApiKeyId);
      expect(mockQuery).toHaveBeenCalledWith('mockCollection', 'mockWhere', 'mockWhere');
    });

    it('should return null if no rate limit data found', async () => {
      const mockQuerySnapshot = {
        empty: true,
        docs: []
      };
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot);

      const result = await getRateLimit(mockCoachId, mockApiKeyId);

      expect(result).toBeNull();
    });
  });
}); 