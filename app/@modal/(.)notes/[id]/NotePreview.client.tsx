'use client';

import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal/Modal';
import NotePreview from '@/components/NotePreview/NotePreview';

interface NotePreviewClientProps {
  noteId: string;
}

export default function NotePreviewClient({ noteId }: NotePreviewClientProps) {
  const router = useRouter();

  if (!noteId) {
    return null;
  }

  return (
    <Modal onClose={() => router.back()}>
      <NotePreview noteId={noteId} />
    </Modal>
  );
}
