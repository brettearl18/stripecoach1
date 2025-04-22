import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Allow all access
  return NextResponse.next();
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 