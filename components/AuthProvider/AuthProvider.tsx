'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { checkSession, logout } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types/user';

interface AuthProviderProps {
  children: ReactNode;
}

const PRIVATE_ROUTES = ['/profile', '/notes'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

function normalizeUserPayload(payload: unknown): User | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const value = payload as Partial<User>;

  if (typeof value.email !== 'string') {
    return null;
  }

  return {
    email: value.email,
    username:
      typeof value.username === 'string' && value.username.length > 0
        ? value.username
        : value.email.split('@')[0],
    avatar: typeof value.avatar === 'string' ? value.avatar : '',
  };
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

        const normalizedUser = normalizeUserPayload(sessionData);

        if (normalizedUser) {
          setUser(normalizedUser);

          if (isAuthRoute) {
            router.replace('/profile');
          }

          return;
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
