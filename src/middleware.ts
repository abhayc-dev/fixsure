import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('shop_session')?.value;
  const { pathname } = request.nextUrl;

  // 1. If user is logged in, prevent them from accessing home or login pages
  if (sessionId) {
    if (pathname === '/' || pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 2. If user is NOT logged in, prevent them from accessing protected pages
  if (!sessionId) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - verify (public verification pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|verify).*)',
  ],
};
