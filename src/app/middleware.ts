import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/signup' || path === '/reset-password' || path === '/';

  // Get the user from cookies
  const userCookie = request.cookies.get('user')?.value;
  let user = null;
  
  try {
    if (userCookie) {
      user = JSON.parse(userCookie);
    }
  } catch (error) {
    console.error('Error parsing user cookie:', error);
  }

  // Redirect logic for authenticated users trying to access public paths
  if (isPublicPath && user) {
    const redirectPath = `/${user.role}/dashboard`;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Redirect logic for unauthenticated users trying to access protected paths
  if (!isPublicPath && !user && !path.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access control
  if (user && !isPublicPath && !path.startsWith('/api')) {
    const userRole = user.role;
    const isAccessingOwnRole = path.startsWith(`/${userRole}`);
    const isAdmin = userRole === 'admin';

    // Admin can access everything, others can only access their own role paths
    if (!isAdmin && !isAccessingOwnRole) {
      return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
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