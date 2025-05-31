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
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding');
  const isCoachOnboardingPage = request.nextUrl.pathname.startsWith('/coach/onboarding');
  const isClientOnboardingPage = request.nextUrl.pathname.startsWith('/client/onboarding');

  // Allow access to public routes
  if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access protected routes
  if (!isAuth && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If user is authenticated and trying to access auth pages
  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is authenticated but hasn't completed onboarding
  if (isAuth && !isOnboardingPage && !isCoachOnboardingPage && !isClientOnboardingPage) {
    const userRole = token?.role as string;
    const onboardingCompleted = token?.onboardingCompleted as boolean;

    if (!onboardingCompleted) {
      // Redirect to appropriate onboarding flow based on role
      if (userRole === 'coach') {
        return NextResponse.redirect(new URL('/coach/onboarding', request.url));
      } else if (userRole === 'client') {
        return NextResponse.redirect(new URL('/client/onboarding', request.url));
      }
    }
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};