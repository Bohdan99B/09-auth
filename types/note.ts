export type NoteTag = "Todo" | "Work" | "Personal" | "Meeting" | "Shopping";

export const NOTE_TAGS: NoteTag[] = [
  "Todo",
  "Work",
  "Personal",
  "Meeting",
  "Shopping",
];

export interface Note {
  id: string;
  title: string;
  content: string;
  tag: NoteTag;
  createdAt: string;
  updatedAt: string;
}

export interface NewNote {
  title: string;
  content: string;
  tag: NoteTag;
}

export interface NoteDraft extends NewNote {}
