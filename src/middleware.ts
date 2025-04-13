import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their allowed roles (for reference only in dev mode)
const protectedRoutes = {
  '/admin': ['admin'],
  '/coach': ['coach', 'admin'],
  '/client': ['client', 'coach', 'admin'],
};

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;

  // Development mode: Allow all access based on URL path
  // This is ONLY for development - proper authentication should be implemented in production
  if (path.startsWith('/admin') || path.startsWith('/coach') || path.startsWith('/client')) {
    return NextResponse.next();
  }

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