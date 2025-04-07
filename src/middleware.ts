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

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;

  // Get user data from cookies
  const userDataStr = request.cookies.get('user')?.value;
  
  // Check if this is a protected route
  const matchingRoute = Object.keys(protectedRoutes).find(route => 
    path.startsWith(route)
  );

  // If it's not a protected route, allow access
  if (!matchingRoute) {
    return NextResponse.next();
  }

  // If no user data, redirect to login
  if (!userDataStr) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Parse user data
    const userData = JSON.parse(userDataStr);
    const userRole = userData.role?.toLowerCase();

    if (!userRole) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if user's role is allowed for this route
    const allowedRoles = protectedRoutes[matchingRoute];
    
    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on role
      switch (userRole) {
        case 'admin':
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        case 'coach':
          return NextResponse.redirect(new URL('/coach/dashboard', request.url));
        case 'client':
          return NextResponse.redirect(new URL('/client/dashboard', request.url));
        default:
          return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // If there's any error parsing user data, redirect to login
    console.error('Error in middleware:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
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