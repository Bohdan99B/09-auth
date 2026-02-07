import { NextRequest, NextResponse } from 'next/server';

const PRIVATE_ROUTES = ['/profile', '/notes'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasAccessToken = Boolean(request.cookies.get('accessToken')?.value);
  const hasRefreshToken = Boolean(request.cookies.get('refreshToken')?.value);
  const canAccessPrivate = hasAccessToken || hasRefreshToken;
  const canSkipAuthPages = hasAccessToken;

  const isPrivateRoute = PRIVATE_ROUTES.some(route =>
    matchesRoute(pathname, route),
  );
  const isAuthRoute = AUTH_ROUTES.some(route => pathname === route);

  if (isPrivateRoute && !canAccessPrivate) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isAuthRoute && canSkipAuthPages) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
