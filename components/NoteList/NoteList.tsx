'use client';

import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNote } from '@/lib/api/clientApi';
import css from './NoteList.module.css';
import type { Note } from '@/types/note';

interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return (
    <ul className={css.list}>
      {notes.map(n => (
        <li key={n.id} className={css.listItem}>
          <h3 className={css.title}>{n.title}</h3>

          <p className={css.content}>{n.content}</p>

          <div className={css.footer}>
            <span className={css.tag}>{n.tag ?? 'No tag'}</span>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link href={`/notes/${n.id}`} className={css.link}>
                View details
              </Link>
              <button
                className={css.button}
                onClick={() => mutation.mutate(n.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
