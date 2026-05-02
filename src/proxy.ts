import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy (formerly Middleware)
 * Used to handle maintenance mode redirection
 */
export default function proxy(request: NextRequest) {
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  const { pathname } = request.nextUrl;

  console.log(`[Proxy] Path: ${pathname}, Maintenance: ${maintenanceMode}`);

  // Si le mode maintenance est activé et qu'on n'est pas déjà sur la page racine (maintenance)
  if (
    maintenanceMode && 
    pathname !== '/' && 
    !pathname.startsWith('/_next') && 
    !pathname.startsWith('/api') &&
    pathname !== '/favicon.ico'
  ) {
    console.log(`[Proxy] Redirecting to root (Maintenance)`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si le mode maintenance est désactivé et qu'on essaie d'accéder à la page de maintenance manuellement
  if (!maintenanceMode && pathname === '/maintenance') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

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
