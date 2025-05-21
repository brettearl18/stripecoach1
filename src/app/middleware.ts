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
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  const path = request.nextUrl.pathname;

  // Allow access to public routes
  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  // If user is not authenticated, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (path.startsWith(route) && !allowedRoles.includes(token.role as string)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // If user is a client and hasn't completed onboarding
  if (path.startsWith('/client') && 
      !path.startsWith('/client/onboarding') && 
      token.role === 'client' && 
      !token.onboardingCompleted) {
    return NextResponse.redirect(new URL('/client/onboarding', request.url));
  }

  // If user has completed onboarding and tries to access onboarding page
  if (path === '/client/onboarding' && token.onboardingCompleted) {
    return NextResponse.redirect(new URL('/client/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 