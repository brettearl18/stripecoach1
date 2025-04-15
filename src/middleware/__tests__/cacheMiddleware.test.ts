import { NextRequest, NextResponse } from 'next/server';
import { cacheMiddleware } from '../cacheMiddleware';
import { cacheGet, cacheSet } from '@/lib/cache';

// Mock cache functions
jest.mock('@/lib/cache', () => ({
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
}));

describe('Cache Middleware', () => {
  const mockCacheGet = cacheGet as jest.MockedFunction<typeof cacheGet>;
  const mockCacheSet = cacheSet as jest.MockedFunction<typeof cacheSet>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (method: string, path: string) => {
    return new NextRequest(new Request(`https://example.com${path}`, { method }));
  };

  const createResponse = (data: any) => {
    return NextResponse.json(data);
  };

  describe('Non-cacheable routes', () => {
    it('should skip caching for non-GET requests', async () => {
      const req = createRequest('POST', '/api/coach/clients');
      const res = createResponse({ data: 'test' });

      const handler = jest.fn().mockResolvedValue(res);
      await cacheMiddleware(req, handler);

      expect(mockCacheGet).not.toHaveBeenCalled();
      expect(mockCacheSet).not.toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
    });

    it('should skip caching for non-cacheable routes', async () => {
      const req = createRequest('GET', '/api/non-cacheable');
      const res = createResponse({ data: 'test' });

      const handler = jest.fn().mockResolvedValue(res);
      await cacheMiddleware(req, handler);

      expect(mockCacheGet).not.toHaveBeenCalled();
      expect(mockCacheSet).not.toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Cacheable routes', () => {
    it('should return cached response when available', async () => {
      const req = createRequest('GET', '/api/coach/clients');
      const cachedData = { data: 'cached' };
      mockCacheGet.mockResolvedValueOnce(cachedData);

      const handler = jest.fn();
      const response = await cacheMiddleware(req, handler);
      const data = await response.json();

      expect(data).toEqual(cachedData);
      expect(mockCacheGet).toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled();
      expect(response.headers.get('X-Cache')).toBe('HIT');
    });

    it('should cache response when not in cache', async () => {
      const req = createRequest('GET', '/api/coach/templates');
      const responseData = { data: 'fresh' };
      mockCacheGet.mockResolvedValueOnce(null);

      const handler = jest.fn().mockResolvedValue(createResponse(responseData));
      const response = await cacheMiddleware(req, handler);
      const data = await response.json();

      expect(data).toEqual(responseData);
      expect(mockCacheGet).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
      expect(mockCacheSet).toHaveBeenCalled();
      expect(response.headers.get('X-Cache')).toBe('MISS');
    });

    it('should use correct TTL based on route', async () => {
      const req = createRequest('GET', '/api/coach/clients');
      const responseData = { data: 'fresh' };
      mockCacheGet.mockResolvedValueOnce(null);

      const handler = jest.fn().mockResolvedValue(createResponse(responseData));
      await cacheMiddleware(req, handler);

      expect(mockCacheSet).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        { ttl: 300 } // 5 minutes for clients
      );
    });
  });

  describe('Error handling', () => {
    it('should handle cache errors gracefully', async () => {
      const req = createRequest('GET', '/api/coach/clients');
      mockCacheGet.mockRejectedValueOnce(new Error('Cache error'));
      const responseData = { data: 'fresh' };

      const handler = jest.fn().mockResolvedValue(createResponse(responseData));
      const response = await cacheMiddleware(req, handler);
      const data = await response.json();

      expect(data).toEqual(responseData);
      expect(handler).toHaveBeenCalled();
      expect(response.headers.get('X-Cache')).toBe('ERROR');
    });
  });
}); 