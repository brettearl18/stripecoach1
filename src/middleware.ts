import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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
  const token = await getToken({ req: request });
  const isClientRoute = request.nextUrl.pathname.startsWith('/client');
  const isOnboardingRoute = request.nextUrl.pathname === '/client/onboarding';

  // Allow access to public routes
  if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // If user is not authenticated, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If user is a client and hasn't completed onboarding
  if (isClientRoute && !isOnboardingRoute && token.role === 'client' && !token.onboardingCompleted) {
    return NextResponse.redirect(new URL('/client/onboarding', request.url));
  }

  // If user has completed onboarding and tries to access onboarding page
  if (isOnboardingRoute && token.onboardingCompleted) {
    return NextResponse.redirect(new URL('/client/dashboard', request.url));
  }

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
    '/client/:path*',
    '/coach/:path*',
    '/admin/:path*',
  ],
};