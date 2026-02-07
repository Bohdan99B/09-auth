"use client";

import type { ChangeEvent } from "react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "@/lib/api";
import { useNoteStore } from "@/lib/store/noteStore";
import { NOTE_TAGS, type NoteDraft, type NoteTag } from "@/types/note";
import css from "./NoteForm.module.css";

type NoteFormErrors = Partial<Record<keyof NoteDraft, string>> & {
  form?: string;
};

function validateDraft(draft: NoteDraft): NoteFormErrors {
  const errors: NoteFormErrors = {};
  const title = draft.title.trim();
  const content = draft.content.trim();

  if (!title) {
    errors.title = "Title is required";
  } else if (title.length < 3) {
    errors.title = "Title must be at least 3 characters";
  } else if (title.length > 50) {
    errors.title = "Title must be at most 50 characters";
  }

  if (content.length > 500) {
    errors.content = "Content must be at most 500 characters";
  }

  if (!NOTE_TAGS.includes(draft.tag)) {
    errors.tag = "Tag is required";
  }

  return errors;
}

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const draft = useNoteStore((state) => state.draft);
  const setDraft = useNoteStore((state) => state.setDraft);
  const clearDraft = useNoteStore((state) => state.clearDraft);
  const [errors, setErrors] = useState<NoteFormErrors>({});

  const mutation = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const field = event.target.name as keyof NoteDraft;

    if (!["title", "content", "tag"].includes(field)) {
      return;
    }

    if (field === "tag" && !NOTE_TAGS.includes(event.target.value as NoteTag)) {
      return;
    }

    setDraft({ [field]: event.target.value } as Partial<NoteDraft>);
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  };

  const submitAction = useCallback(
    async (formData: FormData) => {
      const nextDraft: NoteDraft = {
        title: String(formData.get("title") ?? ""),
        content: String(formData.get("content") ?? ""),
        tag: String(formData.get("tag") ?? "Todo") as NoteTag,
      };

      const validationErrors = validateDraft(nextDraft);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      try {
        setErrors({});
        await mutation.mutateAsync(nextDraft);
        clearDraft();
        router.back();
      } catch (error) {
        setErrors({
          form:
            error instanceof Error
              ? error.message
              : "Could not create a note",
        });
      }
    },
    [clearDraft, mutation, router]
  );

  return (
    <form action={submitAction} className={css.form}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          className={css.input}
          value={draft.title}
          onChange={handleFieldChange}
        />
        {errors.title && <span className={css.error}>{errors.title}</span>}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          value={draft.content}
          onChange={handleFieldChange}
        />
        {errors.content && <span className={css.error}>{errors.content}</span>}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          value={draft.tag}
          onChange={handleFieldChange}
        >
          {NOTE_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        {errors.tag && <span className={css.error}>{errors.tag}</span>}
      </div>

      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={css.submitButton}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Creating..." : "Create note"}
        </button>
      </div>

      {errors.form && <p className={css.error}>{errors.form}</p>}
    </form>
  );
}
