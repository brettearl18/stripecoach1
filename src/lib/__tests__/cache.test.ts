import { Redis } from '@upstash/redis';
import { cacheGet, cacheSet, cacheDelete, withCache, invalidateCache } from '../cache';

// Mock Redis client
jest.mock('@upstash/redis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
    })),
  };
});

describe('Cache Utility', () => {
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedis = new Redis({} as any) as jest.Mocked<Redis>;
  });

  describe('cacheGet', () => {
    it('should return cached data when available', async () => {
      const mockData = { foo: 'bar' };
      mockRedis.get.mockResolvedValueOnce(mockData);

      const result = await cacheGet('test-key');
      expect(result).toEqual(mockData);
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null when cache error occurs', async () => {
      mockRedis.get.mockRejectedValueOnce(new Error('Cache error'));

      const result = await cacheGet('test-key');
      expect(result).toBeNull();
    });
  });

  describe('cacheSet', () => {
    it('should set cache with default TTL', async () => {
      const data = { foo: 'bar' };
      await cacheSet('test-key', data);

      expect(mockRedis.set).toHaveBeenCalledWith('test-key', data, { ex: 3600 });
    });

    it('should set cache with custom TTL and prefix', async () => {
      const data = { foo: 'bar' };
      await cacheSet('test-key', data, { ttl: 60, prefix: 'custom' });

      expect(mockRedis.set).toHaveBeenCalledWith('custom:test-key', data, { ex: 60 });
    });
  });

  describe('cacheDelete', () => {
    it('should delete cache key', async () => {
      await cacheDelete('test-key');
      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
    });

    it('should delete cache key with prefix', async () => {
      await cacheDelete('test-key', 'custom');
      expect(mockRedis.del).toHaveBeenCalledWith('custom:test-key');
    });
  });

  describe('withCache', () => {
    it('should return cached data when available', async () => {
      const mockData = { foo: 'bar' };
      mockRedis.get.mockResolvedValueOnce(mockData);

      const fetchFn = jest.fn();
      const result = await withCache('test-key', fetchFn);

      expect(result).toEqual(mockData);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should fetch and cache data when not in cache', async () => {
      const mockData = { foo: 'bar' };
      mockRedis.get.mockResolvedValueOnce(null);
      const fetchFn = jest.fn().mockResolvedValueOnce(mockData);

      const result = await withCache('test-key', fetchFn);

      expect(result).toEqual(mockData);
      expect(fetchFn).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalledWith('test-key', mockData, { ex: 3600 });
    });
  });

  describe('invalidateCache', () => {
    beforeEach(() => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2']);
    });

    it('should invalidate coach clients cache', async () => {
      await invalidateCache.coachClients('coach-123');
      expect(mockRedis.keys).toHaveBeenCalledWith('coach:coach-123:clients:*');
      expect(mockRedis.del).toHaveBeenCalledWith(['key1', 'key2']);
    });

    it('should invalidate client cache', async () => {
      await invalidateCache.client('client-123');
      expect(mockRedis.keys).toHaveBeenCalledWith('client:client-123:*');
      expect(mockRedis.del).toHaveBeenCalledWith(['key1', 'key2']);
    });

    it('should invalidate template cache', async () => {
      await invalidateCache.template('template-123');
      expect(mockRedis.keys).toHaveBeenCalledWith('template:template-123:*');
      expect(mockRedis.del).toHaveBeenCalledWith(['key1', 'key2']);
    });
  });
}); 