import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';
import { checkSession } from '@/lib/api/serverApi';

const PRIVATE_ROUTES = ['/profile', '/notes'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

interface SessionCheckResult {
  success: boolean;
  setCookie?: string | string[];
}

async function hasValidSession(request: NextRequest): Promise<SessionCheckResult> {
  try {
    const response = await checkSession({
      cookie: request.cookies.toString(),
    });

    return {
      success: Boolean(response.data?.success),
      setCookie: response.headers['set-cookie'],
    };
  } catch {
    return { success: false };
  }
}

function setCookiesFromSession(
  response: NextResponse,
  setCookie?: string | string[],
) {
  if (!setCookie) {
    return;
  }

  const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];

  for (const cookieStr of cookieArray) {
    const parsed = parse(cookieStr);
    const expires = parsed.Expires ? new Date(parsed.Expires) : undefined;
    const maxAge = Number(parsed['Max-Age']);
    const options = {
      expires,
      path: parsed.Path ?? '/',
      maxAge: Number.isFinite(maxAge) ? maxAge : undefined,
    };

    if (parsed.accessToken) {
      response.cookies.set('accessToken', parsed.accessToken, options);
    }

    if (parsed.refreshToken) {
      response.cookies.set('refreshToken', parsed.refreshToken, options);
    }
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasAccessToken = Boolean(request.cookies.get('accessToken')?.value);
  const hasRefreshToken = Boolean(request.cookies.get('refreshToken')?.value);

  const isPrivateRoute = PRIVATE_ROUTES.some(route =>
    matchesRoute(pathname, route),
  );
  const isAuthRoute = AUTH_ROUTES.some(route => pathname === route);

  if (!isPrivateRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  if (hasAccessToken) {
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }

    return NextResponse.next();
  }

  if (!hasRefreshToken) {
    if (isPrivateRoute) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
  }

  const sessionCheck = await hasValidSession(request);

  if (isPrivateRoute && !sessionCheck.success) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isAuthRoute && sessionCheck.success) {
    const response = NextResponse.redirect(new URL('/profile', request.url));
    setCookiesFromSession(response, sessionCheck.setCookie);
    return response;
  }

  const response = NextResponse.next();

  if (sessionCheck.success) {
    setCookiesFromSession(response, sessionCheck.setCookie);
  }

  return response;
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
