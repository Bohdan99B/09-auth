import { api } from '@/lib/api/api';
import type { Note, NewNote, NoteTag } from '@/types/note';
import type { User } from '@/types/user';

interface AuthPayload {
  email: string;
  password: string;
}

interface UpdateMePayload {
  username: string;
}

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

export async function fetchNotes(
  params: FetchNotesParams = {},
): Promise<FetchNotesResponse> {
  const response = await api.get<FetchNotesResponse>('/notes', { params });
  return response.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const response = await api.get<Note>(`/notes/${id}`);
  return response.data;
}

export async function createNote(note: NewNote): Promise<Note> {
  const response = await api.post<Note>('/notes', note);
  return response.data;
}

export async function deleteNote(id: string): Promise<Note> {
  const response = await api.delete<Note>(`/notes/${id}`);
  return response.data;
}

export async function register(payload: AuthPayload): Promise<User> {
  const response = await api.post<User>('/auth/register', payload);
  return response.data;
}

export async function login(payload: AuthPayload): Promise<User> {
  const response = await api.post<User>('/auth/login', payload);
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function checkSession(): Promise<User | null> {
  const response = await api.get<User | null>('/auth/session');
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>('/users/me');
  return response.data;
}

export async function updateMe(payload: UpdateMePayload): Promise<User> {
  const response = await api.patch<User>('/users/me', payload);
  return response.data;
}
