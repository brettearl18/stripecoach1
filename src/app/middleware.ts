import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/signup' || path === '/reset-password';

  // Get the token from the cookies
  const token = request.cookies.get('session')?.value;

  // Redirect logic for authenticated users trying to access public paths
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Redirect logic for unauthenticated users trying to access protected paths
  if (!isPublicPath && !token && !path.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url));
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