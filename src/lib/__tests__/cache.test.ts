import { Cache } from '../cache';
import { Redis } from 'ioredis';

jest.mock('ioredis');

describe('Cache', () => {
  let cache: Cache;
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      expire: jest.fn(),
      exists: jest.fn(),
      keys: jest.fn(),
      flushall: jest.fn()
    } as unknown as jest.Mocked<Redis>;

    (Redis as jest.Mock).mockImplementation(() => mockRedis);
    cache = new Cache();
  });

  describe('get', () => {
    it('should return cached value', async () => {
      const mockValue = { data: 'test' };
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(mockValue));

      const result = await cache.get('test-key');

      expect(result).toEqual(mockValue);
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null for non-existent key', async () => {
      mockRedis.get.mockResolvedValueOnce(null);

      const result = await cache.get('non-existent');

      expect(result).toBeNull();
    });

    it('should handle invalid JSON', async () => {
      mockRedis.get.mockResolvedValueOnce('invalid-json');

      const result = await cache.get('invalid-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value with default TTL', async () => {
      const value = { data: 'test' };
      await cache.set('test-key', value);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(value)
      );
      expect(mockRedis.expire).toHaveBeenCalledWith('test-key', 3600);
    });

    it('should set value with custom TTL', async () => {
      const value = { data: 'test' };
      const ttl = 1800;
      await cache.set('test-key', value, ttl);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(value)
      );
      expect(mockRedis.expire).toHaveBeenCalledWith('test-key', ttl);
    });

    it('should handle set errors', async () => {
      mockRedis.set.mockRejectedValueOnce(new Error('Redis error'));

      await expect(cache.set('test-key', 'value'))
        .rejects
        .toThrow('Redis error');
    });
  });

  describe('delete', () => {
    it('should delete key', async () => {
      await cache.delete('test-key');

      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
    });

    it('should handle delete errors', async () => {
      mockRedis.del.mockRejectedValueOnce(new Error('Redis error'));

      await expect(cache.delete('test-key'))
        .rejects
        .toThrow('Redis error');
    });
  });

  describe('exists', () => {
    it('should return true for existing key', async () => {
      mockRedis.exists.mockResolvedValueOnce(1);

      const result = await cache.exists('test-key');

      expect(result).toBe(true);
      expect(mockRedis.exists).toHaveBeenCalledWith('test-key');
    });

    it('should return false for non-existent key', async () => {
      mockRedis.exists.mockResolvedValueOnce(0);

      const result = await cache.exists('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all keys', async () => {
      await cache.clear();

      expect(mockRedis.flushall).toHaveBeenCalled();
    });

    it('should handle clear errors', async () => {
      mockRedis.flushall.mockRejectedValueOnce(new Error('Redis error'));

      await expect(cache.clear())
        .rejects
        .toThrow('Redis error');
    });
  });

  describe('getKeys', () => {
    it('should return all keys matching pattern', async () => {
      const mockKeys = ['key1', 'key2'];
      mockRedis.keys.mockResolvedValueOnce(mockKeys);

      const result = await cache.getKeys('test-*');

      expect(result).toEqual(mockKeys);
      expect(mockRedis.keys).toHaveBeenCalledWith('test-*');
    });

    it('should return empty array when no keys match', async () => {
      mockRedis.keys.mockResolvedValueOnce([]);

      const result = await cache.getKeys('non-existent-*');

      expect(result).toEqual([]);
    });
  });
}); 