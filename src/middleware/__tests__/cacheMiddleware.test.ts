import { NextRequest, NextResponse } from 'next/server';
import { cacheMiddleware } from '../cacheMiddleware';
import { Cache } from '@/lib/cache';

// Mock env.mjs
jest.mock('@/env.mjs', () => ({
  env: {
    UPSTASH_REDIS_REST_URL: 'http://localhost:6379',
    UPSTASH_REDIS_REST_TOKEN: 'mock-token'
  }
}));

// Mock Cache
jest.mock('@/lib/cache', () => {
  const mockGet = jest.fn();
  const mockSet = jest.fn();

  return {
    Cache: jest.fn().mockImplementation(() => ({
      get: mockGet,
      set: mockSet
    }))
  };
});

// Mock NextResponse
jest.mock('next/server', () => {
  class Headers {
    private store = new Map();

    get(key: string) {
      return this.store.get(key);
    }

    set(key: string, value: string) {
      this.store.set(key, value);
      return this;
    }

    forEach(callback: (value: string, key: string) => void) {
      this.store.forEach((value, key) => callback(value, key));
    }
  }

  const createMockResponse = (data?: any) => {
    const headers = new Headers();
    const response = {
      headers,
      body: data,
      clone: function() { 
        const cloned = createMockResponse(this.body);
        this.headers.forEach((value, key) => cloned.headers.set(key, value));
        return cloned;
      },
      json: async function() { return this.body; }
    };
    return response;
  };

  return {
    NextRequest: jest.fn().mockImplementation((url, init = {}) => ({
      url,
      method: init.method || 'GET',
      headers: new Headers(),
      nextUrl: {
        pathname: new URL(url).pathname,
        href: url
      }
    })),
    NextResponse: {
      next: jest.fn(() => createMockResponse({ message: 'Original Response' })),
      json: jest.fn((data) => createMockResponse(data))
    }
  };
});

// Mock Redis
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn()
  }))
}));

describe('cacheMiddleware', () => {
  let request: NextRequest;
  const responseData = { message: 'Hello World' };
  let mockCache: jest.Mocked<Cache>;

  beforeEach(() => {
    jest.clearAllMocks();
    request = new NextRequest('http://localhost/api/coach/clients');
    mockCache = new Cache() as jest.Mocked<Cache>;
  });

  it('should return cached response if available', async () => {
    mockCache.get.mockResolvedValue(responseData);

    const response = await cacheMiddleware(request);

    expect(response.headers.get('X-Cache')).toBe('HIT');
    expect(await response.json()).toEqual(responseData);
    expect(mockCache.set).not.toHaveBeenCalled();
  });

  it('should cache new response if not in cache', async () => {
    mockCache.get.mockResolvedValue(null);

    const response = await cacheMiddleware(request);

    expect(response.headers.get('X-Cache')).toBe('MISS');
    expect(mockCache.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.any(Number)
    );
  });

  it('should handle cache errors gracefully', async () => {
    mockCache.get.mockRejectedValue(new Error('Cache error'));

    const response = await cacheMiddleware(request);

    expect(response.headers.get('X-Cache')).toBe('BYPASS');
    expect(mockCache.set).not.toHaveBeenCalled();
  });

  it('should handle non-JSON responses', async () => {
    const request = new NextRequest('http://localhost/api/test', {
      headers: {
        'content-type': 'text/plain'
      }
    });

    const response = await cacheMiddleware(request);

    expect(response.headers.get('X-Cache')).toBe('BYPASS');
    expect(mockCache.set).not.toHaveBeenCalled();
  });

  it('should respect cache-control headers', async () => {
    const request = new NextRequest('http://localhost/api/test', {
      headers: {
        'cache-control': 'no-cache'
      }
    });

    const response = await cacheMiddleware(request);

    expect(response.headers.get('X-Cache')).toBe('BYPASS');
    expect(mockCache.set).not.toHaveBeenCalled();
  });

  it('should handle binary responses', async () => {
    const request = new NextRequest('http://localhost/api/test', {
      headers: {
        'content-type': 'application/octet-stream'
      }
    });

    const response = await cacheMiddleware(request);

    expect(response.headers.get('X-Cache')).toBe('BYPASS');
    expect(mockCache.set).not.toHaveBeenCalled();
  });
}); 