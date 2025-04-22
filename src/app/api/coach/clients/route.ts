import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock client data for development
const mockClients = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    progress: 75,
    status: 'active',
    lastUpdate: '2024-03-15',
    metrics: {
      checkInsCompleted: 12,
      streak: 5,
      weightChange: -2.5,
    },
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    progress: 60,
    status: 'on_track',
    lastUpdate: '2024-03-19',
    metrics: {
      checkInsCompleted: 8,
      streak: 2,
      weightChange: -1.8
    }
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.w@example.com',
    progress: 45,
    status: 'needs_attention',
    lastUpdate: '2024-03-18',
    metrics: {
      checkInsCompleted: 5,
      streak: 1,
      weightChange: -0.5
    }
  }
];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    // Filter clients based on search and status
    let filteredClients = mockClients;
    
    if (search) {
      filteredClients = filteredClients.filter(
        client => 
          client.name.toLowerCase().includes(search.toLowerCase()) ||
          client.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filteredClients = filteredClients.filter(client => client.status === status);
    }

    // Calculate pagination
    const total = filteredClients.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedClients = filteredClients.slice(startIndex, endIndex);

    return NextResponse.json({
      clients: paginatedClients,
      total,
      hasMore: endIndex < total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
} 