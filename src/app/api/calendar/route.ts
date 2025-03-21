import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This would be replaced with your database models
interface Event {
  id: number;
  title: string;
  clientId: number;
  clientName: string;
  type: string;
  date: string;
  time: string;
  recurring: boolean;
  frequency?: 'weekly' | 'biweekly' | 'monthly';
  color: string;
}

// Sample data store - replace with your database
let events: Event[] = [];
let nextEventId = 1;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  // Filter events by date range if provided
  let filteredEvents = events;
  if (startDate && endDate) {
    filteredEvents = events.filter(event => 
      event.date >= startDate && event.date <= endDate
    );
  }
  
  return NextResponse.json({ events: filteredEvents });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      clientId, 
      clientName, 
      type, 
      date, 
      time, 
      recurring, 
      frequency,
      syncToClientCalendars 
    } = body;

    // Validate required fields
    if (!title || !clientId || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new event
    const newEvent: Event = {
      id: nextEventId++,
      title,
      clientId,
      clientName,
      type,
      date,
      time,
      recurring,
      frequency,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200' // Default color
    };

    events.push(newEvent);

    // If syncing to client calendars is enabled, this would handle the integration
    if (syncToClientCalendars) {
      // This would integrate with calendar APIs (Google, Outlook, etc.)
      await syncEventToClientCalendars(newEvent);
    }

    return NextResponse.json({ event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Find and update event
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    events[eventIndex] = { ...events[eventIndex], ...updates };

    // Sync updates to calendar if needed
    if (updates.syncToClientCalendars) {
      await syncEventToClientCalendars(events[eventIndex]);
    }

    return NextResponse.json({ event: events[eventIndex] });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const cancelType = searchParams.get('cancelType'); // 'single', 'future', 'all'

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const eventIndex = events.findIndex(e => e.id === Number(id));
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const event = events[eventIndex];

    if (event.recurring && !cancelType) {
      return NextResponse.json(
        { error: 'Cancel type is required for recurring events' },
        { status: 400 }
      );
    }

    // Handle different cancellation types for recurring events
    if (event.recurring) {
      switch (cancelType) {
        case 'single':
          // Remove just this occurrence
          events = events.filter(e => e.id !== Number(id));
          break;
        case 'future':
          // Remove this and all future occurrences
          events = events.filter(e => 
            e.id !== Number(id) && e.date < event.date
          );
          break;
        case 'all':
          // Remove all occurrences of this recurring event
          events = events.filter(e => e.id !== Number(id));
          break;
      }
    } else {
      // Remove single event
      events = events.filter(e => e.id !== Number(id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

// Helper function to sync events with external calendars
async function syncEventToClientCalendars(event: Event) {
  // This would implement the actual calendar API integrations
  console.log('Syncing event to client calendars:', event);
  // Example implementation:
  // - Check which calendar services the client has connected
  // - Use the appropriate API clients to create/update events
  // - Handle errors and retries
  return Promise.resolve();
} 