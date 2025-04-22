import { NextRequest } from 'next/server';
import { GET, POST } from '../clients/route';
import { prisma } from '@/lib/prisma';

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    client: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(() => ({
    id: 'test-coach-id',
    role: 'COACH',
  })),
}));

describe('Coach Clients API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/coach/clients', () => {
    it('should return list of clients for the coach', async () => {
      const mockClients = [
        { id: '1', name: 'Client 1' },
        { id: '2', name: 'Client 2' },
      ];

      (prisma.client.findMany as jest.Mock).mockResolvedValue(mockClients);

      const request = new NextRequest('http://localhost:3000/api/coach/clients');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockClients);
      expect(prisma.client.findMany).toHaveBeenCalledWith({
        where: {
          coachId: 'test-coach-id',
        },
        include: {
          user: true,
        },
      });
    });

    it('should handle errors gracefully', async () => {
      (prisma.client.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/coach/clients');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch clients');
    });
  });

  describe('POST /api/coach/clients', () => {
    it('should create a new client', async () => {
      const mockClientData = {
        name: 'New Client',
        email: 'client@example.com',
      };

      const mockCreatedClient = {
        id: 'new-client-id',
        ...mockClientData,
      };

      (prisma.client.create as jest.Mock).mockResolvedValue(mockCreatedClient);

      const request = new NextRequest('http://localhost:3000/api/coach/clients', {
        method: 'POST',
        body: JSON.stringify(mockClientData),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(mockCreatedClient);
      expect(prisma.client.create).toHaveBeenCalledWith({
        data: {
          ...mockClientData,
          coachId: 'test-coach-id',
        },
      });
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/coach/clients', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Name and email are required');
    });

    it('should handle errors gracefully', async () => {
      (prisma.client.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/coach/clients', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Client',
          email: 'client@example.com',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to create client');
    });
  });
}); 