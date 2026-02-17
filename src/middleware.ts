import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('shop_session')?.value;
  const { pathname } = request.nextUrl;

  // 1. If user has session and hits root, send to dashboard
  if (sessionId && pathname === '/') {
    return NextResponse.redirect(new URL('/jobs', request.url));
  }

  // 2. If user is NOT logged in, prevent them from accessing protected pages
  if (!sessionId || request.nextUrl.searchParams.has('error')) {
    if (pathname.startsWith('/jobs') || pathname.startsWith('/warranties') || pathname.startsWith('/reports') || pathname.startsWith('/settings') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
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
