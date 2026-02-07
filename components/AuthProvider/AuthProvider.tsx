'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { checkSession, logout } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

const PRIVATE_ROUTES = ['/profile', '/notes'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

export default function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const setUser = useAuthStore(state => state.setUser);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const clearIsAuthenticated = useAuthStore(
    state => state.clearIsAuthenticated,
  );
  const [isChecking, setIsChecking] = useState(true);

  const isPrivateRoute = useMemo(
    () =>
      PRIVATE_ROUTES.some(
        route => pathname === route || pathname.startsWith(`${route}/`),
      ),
    [pathname],
  );
  const isAuthRoute = useMemo(() => AUTH_ROUTES.includes(pathname), [pathname]);

  useEffect(() => {
    let isCancelled = false;

    const validateSession = async () => {
      setIsChecking(true);

      try {
        const user = await checkSession();

        if (isCancelled) {
          return;
        }

        if (user) {
          setUser(user);

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
