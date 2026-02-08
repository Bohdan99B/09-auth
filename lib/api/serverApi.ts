import { api } from '@/lib/api/api';
import type { FetchNotesParams, FetchNotesResponse } from '@/lib/api/clientApi';
import type { Note } from '@/types/note';
import type { User } from '@/types/user';
import type { AxiosResponse } from 'axios';

interface ServerRequestConfig {
  cookie: string;
}

export async function fetchNotes(
  params: FetchNotesParams = {},
  config: ServerRequestConfig,
): Promise<FetchNotesResponse> {
  const response = await api.get<FetchNotesResponse>('/notes', {
    params,
    headers: {
      Cookie: config.cookie,
    },
  });

  return response.data;
}

export async function fetchNoteById(
  id: string,
  config: ServerRequestConfig,
): Promise<Note> {
  const response = await api.get<Note>(`/notes/${id}`, {
    headers: {
      Cookie: config.cookie,
    },
  });

  return response.data;
}

export async function getMe(config: ServerRequestConfig): Promise<User> {
  const response = await api.get<User>('/users/me', {
    headers: {
      Cookie: config.cookie,
    },
  });

  return response.data;
}

export async function checkSession(
  config: ServerRequestConfig,
): Promise<AxiosResponse<{ success: boolean }>> {
  return api.get<{ success: boolean }>('/auth/session', {
    headers: {
      Cookie: config.cookie,
    },
  });
}
