import type { NewNote, Note, NoteTag } from "@/types/note";
import { apiClient } from "./client";

export interface FetchNotesParams {
  search?: string;
  page?: number;
  perPage?: number;
  tag?: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
  currentPage: number;
}

export type CreateNoteParams = NewNote;

export async function fetchNotes(
  params: FetchNotesParams = {}
): Promise<FetchNotesResponse> {
  const res = await apiClient.get<FetchNotesResponse>("/", { params });
  return res.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const res = await apiClient.get<Note>(`/${id}`);
  return res.data;
}

export async function createNote(note: CreateNoteParams): Promise<Note> {
  const res = await apiClient.post<Note>("/", note);
  return res.data;
}

export async function deleteNote(id: string): Promise<{ id: string }> {
  const res = await apiClient.delete<{ id: string }>(`/${id}`);
  return res.data;
}
