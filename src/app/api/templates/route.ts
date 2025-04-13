import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has required role
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to create templates' },
        { status: 401 }
      );
    }

    // Check if user is a coach
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'COACH') {
      return NextResponse.json(
        { error: 'Only coaches can create templates' },
        { status: 403 }
      );
    }

    const data = await req.json();

    // Validate required fields
    if (!data.details?.title) {
      return NextResponse.json(
        { error: 'Template title is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(data.sections) || data.sections.length === 0) {
      return NextResponse.json(
        { error: 'Template must have at least one section' },
        { status: 400 }
      );
    }

    // Create the template
    const template = await prisma.template.create({
      data: {
        title: data.details.title,
        description: data.details.description || '',
        categories: data.details.categories,
        subcategories: data.details.subcategories,
        sections: data.sections,
        logic: data.logic || {},
        settings: {
          notifications: data.settings.notifications,
          reminders: data.settings.reminders,
          frequency: data.settings.frequency,
          checkInWindow: data.settings.checkInWindow,
          autoAssign: data.settings.autoAssign
        },
        coachId: session.user.id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create template allocations for each client
    if (Array.isArray(data.allocations) && data.allocations.length > 0) {
      // Verify that all clients belong to this coach
      const clientIds = data.allocations.map(a => a.clientId);
      const clients = await prisma.client.findMany({
        where: {
          id: { in: clientIds },
          coachId: session.user.id
        },
        select: { id: true }
      });

      const validClientIds = new Set(clients.map(c => c.id));
      const invalidClients = data.allocations.filter(a => !validClientIds.has(a.clientId));

      if (invalidClients.length > 0) {
        return NextResponse.json(
          { error: 'Some clients could not be found or do not belong to you' },
          { status: 400 }
        );
      }

      const allocations = await Promise.all(
        data.allocations.map((allocation: any) =>
          prisma.templateAllocation.create({
            data: {
              templateId: template.id,
              clientId: allocation.clientId,
              athleteLevel: allocation.athleteLevel,
              frequency: allocation.frequency,
              startDate: new Date(allocation.startDate),
              checkInWindow: allocation.checkInWindow,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })
        )
      );

      return NextResponse.json(
        { 
          success: true,
          template,
          allocations
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        template
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json(
      { error: 'Failed to save template. Please try again.' },
      { status: 500 }
    );
  }
} 