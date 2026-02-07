'use client';

import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal/Modal';
import NotePreviewClient from './NotePreview.client';

export default function NotePreviewModalPage() {
  const router = useRouter();

  return (
    <Modal onClose={() => router.back()}>
      <NotePreviewClient />
    </Modal>
  );
}
