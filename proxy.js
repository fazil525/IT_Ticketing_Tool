import { NextResponse } from 'next/server';

export function proxy(request) {
  const sessionCookie = request.cookies.get('auratick_session');
  const { pathname } = request.nextUrl;

  // Let APIs, static files, and _next assets pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // If no session exists
  if (!sessionCookie) {
    // Redirect to login if trying to access any page other than /login
    if (pathname !== '/login') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  } else {
    // Session exists
    try {
      const user = JSON.parse(sessionCookie.value);

      // If user is logged in and tries to go to login page or root, redirect to dashboard
      if (pathname === '/login' || pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Restrict access to /admin routes to admins only
      if (pathname.startsWith('/admin') && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (e) {
      // Invalid session format, clear and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auratick_session');
      return response;
    }
  }

  // Redirect root path '/' to dashboard if logged in, otherwise /login
  if (pathname === '/') {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static resource paths
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
