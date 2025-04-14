import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all access to client dashboard
  if (pathname.startsWith('/client')) {
    return NextResponse.next();
  }

  // Redirect all other paths to client dashboard
  return NextResponse.redirect(new URL('/client/dashboard', request.url));
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/coach/:path*',
    '/client/:path*',
    '/sign-in'
  ]
};