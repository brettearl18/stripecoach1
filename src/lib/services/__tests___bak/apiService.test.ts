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
import { db } from '@/lib/firebase/config';
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

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));

describe('API Service', () => {
  const mockCoachId = 'coach123';
  const mockApiKeyId = 'apiKey123';
  const mockApiKeyData = {
    name: 'Test API Key',
    rateLimit: 100,
    webhookUrl: 'https://test.com/webhook',
    allowedIPs: ['127.0.0.1'],
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
  });

  describe('createAPIKey', () => {
    it('should create a new API key with generated keys', async () => {
      const mockDocRef = { id: 'newApiKey123' };
      (collection as jest.Mock).mockReturnValue('apiKeysCollection');
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const result = await createAPIKey(mockCoachId, mockApiKeyData);

      expect(collection).toHaveBeenCalledWith(db, 'apiKeys');
      expect(addDoc).toHaveBeenCalledWith('apiKeysCollection', expect.objectContaining({
        coachId: mockCoachId,
        ...mockApiKeyData,
        createdAt: expect.any(Date),
      }));
      expect(result).toBeDefined();
      expect(result.id).toBe('newApiKey123');
    });

    it('should handle errors when creating API key', async () => {
      (collection as jest.Mock).mockReturnValue('apiKeysCollection');
      (addDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(createAPIKey(mockCoachId, mockApiKeyData)).rejects.toThrow('Firestore error');
    });

    it('should validate rate limit values', async () => {
      const invalidRateLimitData = {
        ...mockApiKeyData,
        rateLimit: -1
      };

      await expect(createAPIKey(mockCoachId, invalidRateLimitData)).rejects.toThrow();
    });

    it('should validate webhook URL format', async () => {
      const invalidWebhookData = {
        ...mockApiKeyData,
        webhookUrl: 'invalid-url'
      };

      await expect(createAPIKey(mockCoachId, invalidWebhookData)).rejects.toThrow();
    });

    it('should validate IP address format', async () => {
      const invalidIPData = {
        ...mockApiKeyData,
        allowedIPs: ['invalid-ip']
      };

      await expect(createAPIKey(mockCoachId, invalidIPData)).rejects.toThrow();
    });
  });

  describe('getAPIKeys', () => {
    it('should return all API keys for a coach', async () => {
      const mockDocs = [
        { id: 'key1', data: () => ({ name: 'Key 1' }) },
        { id: 'key2', data: () => ({ name: 'Key 2' }) },
      ];
      const mockQuerySnapshot = { docs: mockDocs };
      
      (collection as jest.Mock).mockReturnValue('apiKeysCollection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('whereClause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await getAPIKeys(mockCoachId);

      expect(collection).toHaveBeenCalledWith(db, 'apiKeys');
      expect(where).toHaveBeenCalledWith('coachId', '==', mockCoachId);
      expect(query).toHaveBeenCalledWith('apiKeysCollection', 'whereClause');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 'key1', name: 'Key 1' });
    });

    it('should return empty array if no API keys found', async () => {
      (collection as jest.Mock).mockReturnValue('apiKeysCollection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('whereClause');
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });

      const result = await getAPIKeys(mockCoachId);

      expect(result).toHaveLength(0);
    });

    it('should handle concurrent requests', async () => {
      const mockDocs = [
        { id: 'key1', data: () => ({ name: 'Key 1' }) },
        { id: 'key2', data: () => ({ name: 'Key 2' }) },
      ];
      const mockQuerySnapshot = { docs: mockDocs };
      
      (collection as jest.Mock).mockReturnValue('apiKeysCollection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('whereClause');
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const [result1, result2] = await Promise.all([
        getAPIKeys(mockCoachId),
        getAPIKeys(mockCoachId)
      ]);

      expect(result1).toHaveLength(2);
      expect(result2).toHaveLength(2);
      expect(collection).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAPIKey', () => {
    it('should return a specific API key', async () => {
      const mockDocData = { name: 'Test Key' };
      const mockDocSnap = { exists: () => true, data: () => mockDocData, id: mockApiKeyId };
      
      (doc as jest.Mock).mockReturnValue('docRef');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await getAPIKey(mockApiKeyId);

      expect(doc).toHaveBeenCalledWith(db, 'apiKeys', mockApiKeyId);
      expect(result).toEqual({ id: mockApiKeyId, ...mockDocData });
    });

    it('should return null if API key not found', async () => {
      const mockDocSnap = { exists: () => false };
      
      (doc as jest.Mock).mockReturnValue('docRef');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await getAPIKey(mockApiKeyId);

      expect(result).toBeNull();
    });

    it('should handle invalid API key ID format', async () => {
      const mockDocSnap = { exists: () => false };
      
      (doc as jest.Mock).mockReturnValue('docRef');
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await getAPIKey('invalid-id');
      expect(result).toBeNull();
    });
  });

  describe('updateAPIKey', () => {
    it('should update an API key', async () => {
      const mockDocRef = { id: mockApiKeyId };
      const updateData = { name: 'Updated API Key' };
      
      (doc as jest.Mock).mockReturnValue(mockDocRef);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateAPIKey(mockApiKeyId, updateData);

      expect(doc).toHaveBeenCalledWith(db, 'apiKeys', mockApiKeyId);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
        ...updateData,
        lastUsed: expect.any(Date)
      });
    });

    it('should throw error when updating with negative rate limit', async () => {
      const id = 'test-id';
      const data = { rateLimit: { requestsPerMinute: -1 } };
      await expect(updateAPIKey(id, data)).rejects.toThrow('Rate limit cannot be negative');
    });

    it('should handle errors when updating API key', async () => {
      (doc as jest.Mock).mockReturnValue('docRef');
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await expect(updateAPIKey(mockApiKeyId, { name: 'Updated' })).rejects.toThrow('Update failed');
    });

    it('should validate rate limit updates', async () => {
      const invalidRateLimitUpdate = {
        rateLimit: {
          requestsPerMinute: -1
        }
      };

      await expect(updateAPIKey(mockApiKeyId, invalidRateLimitUpdate)).rejects.toThrow();
    });

    it('should handle concurrent updates', async () => {
      const updateData = { name: 'Updated API Key' };
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await Promise.all([
        updateAPIKey(mockApiKeyId, updateData),
        updateAPIKey(mockApiKeyId, updateData)
      ]);

      expect(updateDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteAPIKey', () => {
    it('should delete an API key', async () => {
      const mockDocRef = { id: mockApiKeyId };
      
      (doc as jest.Mock).mockReturnValue(mockDocRef);
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await deleteAPIKey(mockApiKeyId);

      expect(doc).toHaveBeenCalledWith(db, 'apiKeys', mockApiKeyId);
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it('should handle errors when deleting API key', async () => {
      (doc as jest.Mock).mockReturnValue('docRef');
      (deleteDoc as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      await expect(deleteAPIKey(mockApiKeyId)).rejects.toThrow('Delete failed');
    });

    it('should handle concurrent deletions', async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await Promise.all([
        deleteAPIKey(mockApiKeyId),
        deleteAPIKey(mockApiKeyId)
      ]);

      expect(deleteDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAPIUsage', () => {
    it('should get API usage for a specific coach and API key', async () => {
      const mockUsageData = { usage: 100 };
      const mockQuerySnapshot = {
        empty: false,
        docs: [{ id: 'usage1', data: () => mockUsageData }]
      };
      const mockCollectionRef = 'collectionRef';
      const mockWhereQuery1 = 'whereQuery1';
      const mockWhereQuery2 = 'whereQuery2';
      const mockFinalQuery = 'finalQuery';

      (collection as jest.Mock).mockReturnValue(mockCollectionRef);
      (where as jest.Mock).mockReturnValueOnce(mockWhereQuery1).mockReturnValueOnce(mockWhereQuery2);
      (query as jest.Mock).mockReturnValue(mockFinalQuery);
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await getAPIUsage('coach1', 'key1');

      expect(collection).toHaveBeenCalledWith(db, 'apiUsage');
      expect(where).toHaveBeenCalledWith('coachId', '==', 'coach1');
      expect(where).toHaveBeenCalledWith('apiKeyId', '==', 'key1');
      expect(query).toHaveBeenCalledWith(mockCollectionRef, mockWhereQuery1, mockWhereQuery2);
      expect(getDocs).toHaveBeenCalledWith(mockFinalQuery);
      expect(result).toEqual([{ id: 'usage1', ...mockUsageData }]);
    });
  });

  describe('getRateLimit', () => {
    it('should get rate limit for a specific coach and API key', async () => {
      const mockRateLimitData = { limit: 1000 };
      const mockQuerySnapshot = {
        empty: false,
        docs: [{ id: 'rateLimit1', data: () => mockRateLimitData }]
      };
      const mockCollectionRef = 'collectionRef';
      const mockWhereQuery1 = 'whereQuery1';
      const mockWhereQuery2 = 'whereQuery2';
      const mockFinalQuery = 'finalQuery';

      (collection as jest.Mock).mockReturnValue(mockCollectionRef);
      (where as jest.Mock).mockReturnValueOnce(mockWhereQuery1).mockReturnValueOnce(mockWhereQuery2);
      (query as jest.Mock).mockReturnValue(mockFinalQuery);
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await getRateLimit('coach1', 'key1');

      expect(collection).toHaveBeenCalledWith(db, 'apiRateLimits');
      expect(where).toHaveBeenCalledWith('coachId', '==', 'coach1');
      expect(where).toHaveBeenCalledWith('apiKeyId', '==', 'key1');
      expect(query).toHaveBeenCalledWith(mockCollectionRef, mockWhereQuery1, mockWhereQuery2);
      expect(getDocs).toHaveBeenCalledWith(mockFinalQuery);
      expect(result).toEqual({ id: 'rateLimit1', ...mockRateLimitData });
    });

    it('should return null when no rate limit is found', async () => {
      const mockCollectionRef = 'collectionRef';
      const mockWhereQuery1 = 'whereQuery1';
      const mockWhereQuery2 = 'whereQuery2';
      const mockFinalQuery = 'finalQuery';

      (collection as jest.Mock).mockReturnValue(mockCollectionRef);
      (where as jest.Mock).mockReturnValueOnce(mockWhereQuery1).mockReturnValueOnce(mockWhereQuery2);
      (query as jest.Mock).mockReturnValue(mockFinalQuery);
      (getDocs as jest.Mock).mockResolvedValue({
        empty: true,
        docs: []
      });

      const result = await getRateLimit('coach1', 'key1');

      expect(collection).toHaveBeenCalledWith(db, 'apiRateLimits');
      expect(where).toHaveBeenCalledWith('coachId', '==', 'coach1');
      expect(where).toHaveBeenCalledWith('apiKeyId', '==', 'key1');
      expect(query).toHaveBeenCalledWith(mockCollectionRef, mockWhereQuery1, mockWhereQuery2);
      expect(result).toBeNull();
    });
  });
}); 