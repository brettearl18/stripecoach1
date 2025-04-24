import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their allowed roles (for reference only in dev mode)
const protectedRoutes = {
  '/admin': ['admin'],
  '/coach': ['coach', 'admin'],
  '/client': ['client', 'coach', 'admin'],
};

export async function middleware(request: NextRequest) {
  // Allow all access in development mode
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};