import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware ensures navigation works properly without transitions
export function middleware(request: NextRequest) {
  // Get response
  const response = NextResponse.next();
  
  // Add header to disable transitions and animations
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

// Apply to all routes except for static assets
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)',
  ],
}; 