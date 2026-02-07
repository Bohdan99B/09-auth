'use client';

import { useParams } from 'next/navigation';
import NotePreview from '@/components/NotePreview/NotePreview';

export default function NotePreviewClient() {
  const params = useParams();
  const rawId = params?.id;
  const noteId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!noteId) {
    return null;
  }

  return <NotePreview noteId={noteId} />;
}
