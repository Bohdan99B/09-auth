import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { fetchNotes } from '@/lib/api/serverApi';
import { getQueryClient } from '@/lib/queryClient';
import { NOTE_TAGS, type NoteTag } from '@/types/note';
import NotesClient from './Notes.client';

interface FilterNotesPageProps {
  params: Promise<{ slug: string[] }>;
}

function resolveTag(slug: string[]): NoteTag | undefined {
  if (slug.length !== 1) {
    notFound();
  }

  const rawTag = decodeURIComponent(slug[0]);

  if (rawTag === 'all') {
    return undefined;
  }

  if (!NOTE_TAGS.includes(rawTag as NoteTag)) {
    notFound();
  }

  return rawTag as NoteTag;
}

export async function generateMetadata({
  params,
}: FilterNotesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = resolveTag(slug);
  const filterLabel = tag ?? 'all';

  return {
    title: `Notes: ${filterLabel} | NoteHub`,
    description: `Browse NoteHub notes filtered by: ${filterLabel}.`,
    alternates: {
      canonical: `/notes/filter/${encodeURIComponent(filterLabel)}`,
    },
    openGraph: {
      title: `Notes: ${filterLabel} | NoteHub`,
      description: `Browse NoteHub notes filtered by: ${filterLabel}.`,
      url: `/notes/filter/${encodeURIComponent(filterLabel)}`,
      images: [
        {
          url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
          width: 1200,
          height: 630,
          alt: 'NoteHub notes filter page',
        },
      ],
    },
  };
}

export default async function FilterNotesPage({
  params,
}: FilterNotesPageProps) {
  const { slug } = await params;
  const tag = resolveTag(slug);
  const cookieStore = await cookies();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['notes', tag ?? 'all', '', 1],
    queryFn: () =>
      fetchNotes(
        { search: '', page: 1, perPage: 12, tag },
        { cookie: cookieStore.toString() },
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={tag} />
    </HydrationBoundary>
  );
}
