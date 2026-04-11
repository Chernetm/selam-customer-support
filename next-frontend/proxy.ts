import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy: The Next.js v16 replacement for middleware.
 * This runs before every request matches a route.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get('adminToken')?.value;
  const customerToken = request.cookies.get('customerToken')?.value;
  const role = request.cookies.get('role')?.value;

  console.log(`[Proxy] Path: ${pathname} | Admin: ${!!adminToken} | Customer: ${!!customerToken} | Role: ${role}`);

  // 1. Defining route categories
  const isSuperAdminRoute =
    pathname === '/dashboard' ||
    pathname === '/admin-register' ||
    pathname.startsWith('/admin/dashboard') ||
    pathname.startsWith('/admin/system') ||
    pathname.startsWith('/admin/performance');

  const isAdminRoute = pathname.startsWith('/admin/') || isSuperAdminRoute;
  const isCustomerRoute = pathname.startsWith('/chat');
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/admin-login' ||
    pathname === '/customer-register';

  // 2. Implementation of Role-Based Access Control (RBAC)

  // A. Admin & Sub-Admin Routes
  if (isAdminRoute) {
    if (!adminToken) {
      // Unauthenticated admin access -> Redirect to login
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }

    // Role check for SuperAdmin restricted pages
    const isSuperAdmin = role === 'super-admin';
    if (isSuperAdminRoute && !isSuperAdmin) {
      // Staff trying to access management pages -> Redirect to Chat
      return NextResponse.redirect(new URL('/admin/chat', request.url));
    }
  }

  // B. Customer Routes
  if (isCustomerRoute && !customerToken && !adminToken) {
    // Unauthenticated customer access -> Redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // C. Authenticated Redirects (Prevention of redundant logins)
  if (isAuthRoute) {
    if (adminToken) {
      const isSuperAdmin = role === 'super_admin' || role === 'super-admin';
      return NextResponse.redirect(new URL(isSuperAdmin ? '/dashboard' : '/admin/chat', request.url));
    }
    if (customerToken) {
      return NextResponse.redirect(new URL('/chat', request.url));
    }
  }

  // Allow the request to proceed to the route handler / page
  return NextResponse.next();
}

/**
 * Matcher configuration for Proxy.
 * Excludes static assets and API routes for performance.
 */
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
