import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { getQueryClient } from "@/lib/queryClient";
import { fetchNoteById } from "@/lib/api";
import NoteDetailsClient from "./NoteDetails.client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const note = await fetchNoteById(id);
    const description = note.content.slice(0, 140) || "Open note details.";

    return {
      title: `${note.title} | NoteHub`,
      description,
      alternates: {
        canonical: `/notes/${id}`,
      },
      openGraph: {
        title: `${note.title} | NoteHub`,
        description,
        url: `/notes/${id}`,
        images: [
          {
            url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
            width: 1200,
            height: 630,
            alt: "NoteHub note details page",
          },
        ],
      },
    };
  } catch {
    return {
      title: "Note details | NoteHub",
      description: "Open note details in NoteHub.",
      alternates: {
        canonical: `/notes/${id}`,
      },
      openGraph: {
        title: "Note details | NoteHub",
        description: "Open note details in NoteHub.",
        url: `/notes/${id}`,
        images: [
          {
            url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
            width: 1200,
            height: 630,
            alt: "NoteHub note details page",
          },
        ],
      },
    };
  }
}

export default async function NoteDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}
