import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware ensures proper navigation in production
export function middleware(request: NextRequest) {
  // Return the response unchanged
  return NextResponse.next();
}

// Define which routes this middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except for api routes, static files, and other exceptions
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)',
  ],
}; 