'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { checkSession, getMe, logout } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types/user';

interface AuthProviderProps {
  children: ReactNode;
}

const PRIVATE_ROUTES = ['/profile', '/notes'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

function isUserPayload(payload: unknown): payload is User {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const value = payload as Partial<User>;

  return (
    typeof value.email === 'string' &&
    typeof value.username === 'string' &&
    typeof value.avatar === 'string'
  );
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const setUser = useAuthStore(state => state.setUser);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const clearIsAuthenticated = useAuthStore(
    state => state.clearIsAuthenticated,
  );
  const [isChecking, setIsChecking] = useState(true);

  const isPrivateRoute = PRIVATE_ROUTES.some(
    route => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    let isCancelled = false;

    const validateSession = async () => {
      setIsChecking(true);

      try {
        const sessionData = await checkSession();

        if (isCancelled) {
          return;
        }

        if (isUserPayload(sessionData)) {
          setUser(sessionData);

          if (isAuthRoute) {
            router.replace('/profile');
          }

          return;
        }

        if (sessionData) {
          try {
            const me = await getMe();

            if (isCancelled) {
              return;
            }

            if (isUserPayload(me)) {
              setUser(me);

              if (isAuthRoute) {
                router.replace('/profile');
              }

              return;
            }
          } catch {
            // noop
          }
        }

        clearIsAuthenticated();

        if (isPrivateRoute) {
          await logout().catch(() => null);
          router.replace('/sign-in');
        }
      } finally {
        if (!isCancelled) {
          setIsChecking(false);
        }
      }
    };

    validateSession();

    return () => {
      isCancelled = true;
    };
  }, [
    clearIsAuthenticated,
    isAuthRoute,
    isPrivateRoute,
    pathname,
    router,
    setUser,
  ]);

  if (isPrivateRoute && (isChecking || !isAuthenticated)) {
    return <p>Loading, please wait...</p>;
  }

  return <>{children}</>;
}
