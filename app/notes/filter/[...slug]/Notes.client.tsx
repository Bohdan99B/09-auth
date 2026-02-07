"use client";

import Link from "next/link";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import SearchBox from "@/components/SearchBox/SearchBox";
import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";
import type { NoteTag } from "@/types/note";
import css from "../../NotesPage.module.css";

interface NotesClientProps {
  tag?: NoteTag;
}

export default function NotesClient({ tag }: NotesClientProps) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["notes", tag ?? "all", search, page],
    queryFn: () => fetchNotes({ search, page, perPage: 12, tag }),
    placeholderData: (prev) => prev,
  });

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 1;

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const handleSearch = (value: string) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const errorMessage =
    error instanceof Error ? error.message : "Something went wrong";

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={searchInput} onChange={handleSearch} />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        <Link href="/notes/action/create" className={css.button}>
          Create note +
        </Link>
      </header>

      {isLoading && <p>Loading, please wait...</p>}
      {isError && <p>{errorMessage}</p>}
      {!isLoading && !isError && notes.length === 0 && <p>No notes found</p>}

      {notes.length > 0 && <NoteList notes={notes} />}
    </div>
  );
}
