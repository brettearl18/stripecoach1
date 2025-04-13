import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;

  // Check if this is a protected route
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    path.startsWith(route)
  );

  if (isProtectedRoute) {
    // Get the user's token
    const token = await getToken({ req: request });

    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }

    // Get the allowed roles for this route
    const allowedRoles = Object.entries(protectedRoutes)
      .filter(([route]) => path.startsWith(route))
      .map(([_, roles]) => roles)
      .flat();

    // Check if user's role is allowed
    if (!allowedRoles.includes(token.role as string)) {
      // If client tries to access coach/admin routes, redirect to client dashboard
      if (token.role === 'client' && path.startsWith('/coach')) {
        return NextResponse.redirect(new URL('/client/dashboard', request.url));
      }
      // If unauthorized, redirect to 403 page
      return NextResponse.redirect(new URL('/403', request.url));
    }

    // For client-specific routes, ensure clients can only access their own data
    if (token.role === 'client' && path.includes('/client/')) {
      const clientId = path.split('/')[3]; // Get client ID from URL if present
      if (clientId && clientId !== token.sub) {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    }
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