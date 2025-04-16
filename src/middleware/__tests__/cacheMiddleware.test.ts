import { NextResponse } from 'next/server';
import { cacheMiddleware } from '../cacheMiddleware';
import { cacheGet, cacheSet } from '@/lib/cache';

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => new MockResponse()),
    json: jest.fn((data, options) => {
      const response = new MockResponse(data);
      if (options?.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          response.set(key, value);
        });
      }
      return response;
    })
  }
}));

// Mock cache functions
jest.mock('@/lib/cache', () => ({
  cacheGet: jest.fn(),
  cacheSet: jest.fn()
}));

class MockResponse {
  private _headers: Record<string, string> = {};
  private _body;

  constructor(body = null) {
    this._body = body;
  }

  headers() {
    return this._headers;
  }

  get(key: string) {
    return this._headers[key];
  }

  set(key: string, value: string) {
    this._headers[key] = value;
    return this;
  }

  json() {
    return Promise.resolve(this._body);
  }

  clone() {
    const clone = new MockResponse(this._body);
    Object.entries(this._headers).forEach(([key, value]) => {
      clone.set(key, value);
    });
    return clone;
  }
}

// Helper function to create mock requests
function createMockRequest(pathname: string, method: string = 'GET') {
  return {
    method,
    nextUrl: { 
      pathname,
      href: `http://localhost:3000${pathname}` 
    },
    url: `http://localhost:3000${pathname}`,
    clone: function() { return this; }
  };
}

describe('cacheMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return cached response if available', async () => {
    const cachedData = { test: 'data' };
    (cacheGet as jest.Mock).mockResolvedValueOnce(cachedData);

    const request = createMockRequest('/api/coach/clients');
    const response = await cacheMiddleware(request);

    expect(response).toBeInstanceOf(MockResponse);
    expect(response.get('X-Cache')).toBe('HIT');
    expect(await response.json()).toEqual(cachedData);
    expect(cacheGet).toHaveBeenCalledWith(request.url);
    expect(cacheSet).not.toHaveBeenCalled();
  });

  it('should proceed with request if cache not available', async () => {
    (cacheGet as jest.Mock).mockResolvedValueOnce(null);
    const responseData = { test: 'response' };
    (NextResponse.next as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(responseData)
    });

    const request = createMockRequest('/api/coach/clients');
    const response = await cacheMiddleware(request);

    expect(response).toBeInstanceOf(MockResponse);
    expect(response.get('X-Cache')).toBe('MISS');
    expect(await response.json()).toEqual(responseData);
    expect(cacheGet).toHaveBeenCalledWith(request.url);
    expect(cacheSet).toHaveBeenCalledWith(request.url, responseData, expect.any(Object));
  });

  it('should not cache non-GET requests', async () => {
    const request = createMockRequest('/api/coach/clients', 'POST');
    const response = await cacheMiddleware(request);

    expect(response).toBeInstanceOf(MockResponse);
    expect(cacheGet).not.toHaveBeenCalled();
    expect(cacheSet).not.toHaveBeenCalled();
  });

  it('should not cache non-API routes', async () => {
    const request = createMockRequest('/non-api-route');
    const response = await cacheMiddleware(request);

    expect(response).toBeInstanceOf(MockResponse);
    expect(cacheGet).not.toHaveBeenCalled();
    expect(cacheSet).not.toHaveBeenCalled();
  });
}); 