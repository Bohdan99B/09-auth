import { NextRequest, NextResponse } from 'next/server';

const PRIVATE_ROUTES = ['/profile', '/notes'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function isUserPayload(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const value = payload as { email?: unknown };
  return typeof value.email === 'string';
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const cookie = request.headers.get('cookie');

  if (!cookie) {
    return false;
  }

  try {
    const response = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
      method: 'GET',
      headers: { cookie },
      cache: 'no-store',
    });

    if (!response.ok) {
      return false;
    }

    const data: unknown = await response.json();
    return isUserPayload(data);
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasAccessToken = Boolean(request.cookies.get('accessToken')?.value);
  const hasRefreshToken = Boolean(request.cookies.get('refreshToken')?.value);
  const canAccessPrivate = hasAccessToken || hasRefreshToken;

  const isPrivateRoute = PRIVATE_ROUTES.some(route =>
    matchesRoute(pathname, route),
  );
  const isAuthRoute = AUTH_ROUTES.some(route => pathname === route);

  if (isPrivateRoute && !canAccessPrivate) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isAuthRoute && hasAccessToken) {
    const authenticated = await hasValidSession(request);

    if (authenticated) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
