import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  const { pathname } = request.nextUrl;

  // Si le mode maintenance est activé et qu'on n'est pas déjà sur la page de maintenance
  // et qu'on ne cherche pas à accéder aux fichiers statiques ou API (optionnel)
  if (
    maintenanceMode && 
    pathname !== '/maintenance' && 
    !pathname.startsWith('/_next') && 
    !pathname.startsWith('/api') &&
    pathname !== '/favicon.ico'
  ) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
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
