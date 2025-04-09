import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their allowed roles
const protectedRoutes = {
  '/admin': ['admin'],
  '/admin/dashboard': ['admin'],
  '/admin/coaches': ['admin'],
  '/admin/clients': ['admin'],
  '/admin/settings': ['admin'],
  '/admin/analytics': ['admin'],
  '/admin/billing': ['admin'],
  '/admin/programs': ['admin'],
  '/admin/reports': ['admin'],
  '/admin/messages': ['admin'],
  
  '/coach': ['coach', 'admin'],
  '/coach/dashboard': ['coach', 'admin'],
  '/coach/dashboard2': ['coach', 'admin'],
  '/coach/clients': ['coach', 'admin'],
  '/coach/programs': ['coach', 'admin'],
  '/coach/templates': ['coach', 'admin'],
  '/coach/settings': ['coach', 'admin'],
  '/coach/messages': ['coach', 'admin'],
  '/coach/responses': ['coach', 'admin'],
  '/coach/analytics': ['coach', 'admin'],
  
  '/client': ['client', 'coach', 'admin'],
  '/client/dashboard': ['client', 'coach', 'admin'],
  '/client/workouts': ['client', 'coach', 'admin'],
  '/client/nutrition': ['client', 'coach', 'admin'],
  '/client/progress': ['client', 'coach', 'admin'],
  '/client/settings': ['client', 'coach', 'admin'],
  '/client/messages': ['client', 'coach', 'admin'],
  '/client/check-ins': ['client', 'coach', 'admin'],
};

export async function middleware(request: NextRequest) {
  // Temporarily bypass all authentication checks
    return NextResponse.next();
}

// Update matcher to include all protected routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/coach/:path*',
    '/client/:path*',
    '/login'
  ]
};