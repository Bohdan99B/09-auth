'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getMe, updateMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import css from './EditProfilePage.module.css';

export default function EditProfilePage() {
  const router = useRouter();
  const setUser = useAuthStore(state => state.setUser);
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const mutation = useMutation({
    mutationFn: updateMe,
    onSuccess: updatedUser => {
      setUser(updatedUser);
      router.push('/profile');
    },
    onError: () => {
      setError('Could not update profile');
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await mutation.mutateAsync({ username: (username ?? user?.username ?? '').trim() });
    } catch {
      return;
    }
  };

  if (isLoading || !user) {
    return <p>Loading, please wait...</p>;
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        <Image
          src={
            user.avatar ||
            'https://ac.goit.global/fullstack/react/default-avatar.jpg'
          }
          alt="User Avatar"
          width={120}
          height={120}
          className={css.avatar}
        />

        <form className={css.profileInfo} onSubmit={handleSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              className={css.input}
              value={username ?? user.username}
              onChange={event => setUsername(event.target.value)}
            />
          </div>

          <p>Email: {user.email}</p>

          <div className={css.actions}>
            <button
              type="submit"
              className={css.saveButton}
              disabled={mutation.isPending}
            >
              Save
            </button>
            <button
              type="button"
              className={css.cancelButton}
              onClick={() => router.push('/profile')}
            >
              Cancel
            </button>
          </div>
        </form>

        {error && <p>{error}</p>}
      </div>
    </main>
  );
}
