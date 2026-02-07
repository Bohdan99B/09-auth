import type { Metadata } from 'next';
import css from './not-found.module.css';

export const metadata: Metadata = {
  title: '404 | NoteHub',
  description: 'This page does not exist in NoteHub.',
  alternates: {
    canonical: '/not-found',
  },
  openGraph: {
    title: '404 | NoteHub',
    description: 'This page does not exist in NoteHub.',
    url: '/not-found',
    images: [
      {
        url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
        width: 1200,
        height: 630,
        alt: 'NoteHub 404 page',
      },
    ],
  },
};

export default function NotFoundPage() {
  return (
    <main>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>
        Sorry, the page you are looking for does not exist.
      </p>
    </main>
  );
}
