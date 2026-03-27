import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Define excluded paths (static files, api routes that don't need tenant isolation, etc.)
  const isExcluded = 
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api/webhooks') || 
    url.pathname.includes('/favicon.ico');

  if (isExcluded) {
    return NextResponse.next();
  }

  // Handle subdomain-based multi-tenancy
  // Example: gym1.gymflow.com -> we extract 'gym1' as the tenant slug
  // For local development: gym1.localhost:3000
  let tenantSlug = '';
  
  const currentHost = process.env.NODE_ENV === 'production' 
    ? hostname.replace(`.gymflow.com`, '')
    : hostname.replace(`.localhost:3000`, '');

  if (currentHost && currentHost !== hostname && currentHost !== 'www' && currentHost !== 'gymflow.com') {
    tenantSlug = currentHost;
  }

  // If we found a tenant slug, we rewrite the URL to include it in the path
  // or set a custom header that our API/Pages can use.
  if (tenantSlug) {
    // You can rewrite to /_tenants/[tenantSlug]/... or just add a header
    const response = NextResponse.next();
    response.headers.set('x-tenant-slug', tenantSlug);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
