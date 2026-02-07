'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { getMe, logout } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import css from './AuthNavigation.module.css';

export default function AuthNavigation() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const clearIsAuthenticated = useAuthStore(
    state => state.clearIsAuthenticated,
  );
  const setUser = useAuthStore(state => state.setUser);

  const mutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearIsAuthenticated();
      router.push('/sign-in');
    },
  });

  useEffect(() => {
    if (!isAuthenticated || user) {
      return;
    }

    getMe()
      .then(currentUser => setUser(currentUser))
      .catch(() => clearIsAuthenticated());
  }, [clearIsAuthenticated, isAuthenticated, setUser, user]);

  const emailLogin = user?.email?.split('@')[0] ?? user?.username ?? 'User';

  if (!isAuthenticated) {
    return (
      <>
        <li className={css.navigationItem}>
          <Link href="/sign-in" prefetch={false} className={css.navigationLink}>
            Login
          </Link>
        </li>

        <li className={css.navigationItem}>
          <Link href="/sign-up" prefetch={false} className={css.navigationLink}>
            Register
          </Link>
        </li>
      </>
    );
  }

  return (
    <>
      <li className={css.navigationItem}>
        <Link href="/profile" prefetch={false} className={css.navigationLink}>
          Profile
        </Link>
      </li>

      <li className={css.navigationItem}>
        <p className={css.userEmail}>{emailLogin}</p>
        <button
          className={css.logoutButton}
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          Logout
        </button>
      </li>
    </>
  );
}
