import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  console.log('Middleware - Current path:', path);

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/signup' || path === '/reset-password' || path === '/';
  console.log('Middleware - Is public path:', isPublicPath);

  // Get the token from NextAuth
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  console.log('Middleware - Token data:', {
    exists: !!token,
    role: token?.role,
    email: token?.email,
    path
  });

  // If accessing a public path while authenticated, redirect to role-specific dashboard
  if (isPublicPath && token?.role) {
    const redirectPath = `/${token.role}/dashboard`;
    console.log('Middleware - Redirecting authenticated user from public path to:', redirectPath);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // If accessing a protected path without authentication, redirect to login
  if (!isPublicPath && !token) {
    console.log('Middleware - Redirecting unauthenticated user to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated, check role-based access
  if (token?.role && !isPublicPath) {
    const userRole = token.role;
    
    // Extract the role from the URL path (e.g., /coach/dashboard -> coach)
    const urlRole = path.split('/')[1];
    
    console.log('Middleware - Role check:', {
      userRole,
      urlRole,
      path
    });

    // Verify role-based access
    if (userRole === 'admin') {
      // Admin can access everything
      console.log('Middleware - Admin access granted');
      return NextResponse.next();
    } else if (urlRole !== userRole) {
      // Other roles can only access their own paths
      const correctPath = `/${userRole}/dashboard`;
      console.log('Middleware - Redirecting to correct role path:', correctPath);
      return NextResponse.redirect(new URL(correctPath, request.url));
    }
  }

  console.log('Middleware - Access granted');
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