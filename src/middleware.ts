import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/sign-in',
  '/signup',
  '/forgot-password',
  '/',
  '/api/auth',
];

// Define protected routes and their allowed roles
const protectedRoutes = {
  '/admin': ['admin'],
  '/coach': ['coach', 'admin'],
  '/client': ['client', 'coach', 'admin'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token = request.cookies.get('auth-token');
  
  // If no token is present and trying to access a protected route,
  // redirect to sign-in page
  if (!token) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // For now, allow access if token exists
  // In production, you would verify the token and check roles
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};