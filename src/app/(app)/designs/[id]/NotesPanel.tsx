"use client";

import { useTransition } from "react";
import { NoteRow } from "@/lib/repo";
import { addNoteAction, deleteNoteAction } from "@/app/actions/detail";

export default function NotesPanel({ designId, notes }: { designId: string; notes: NoteRow[] }) {
  const [, startTransition] = useTransition();
  const addAction = addNoteAction.bind(null, designId);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-medium mb-4">Notes</h2>

      <form action={addAction} className="flex gap-2 mb-4">
        <input
          name="body"
          placeholder="Add a note…"
          className="h-9 flex-1 rounded-lg bg-surface-2 border border-border px-3 text-sm outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          className="h-9 px-3 rounded-lg bg-surface-2 border border-border text-xs font-medium hover:bg-border transition-colors"
        >
          Add
        </button>
      </form>

      {notes.length === 0 ? (
        <p className="text-xs text-muted-2 italic">No notes yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <div key={note.id} className="group flex items-start justify-between gap-2 text-sm">
              <div>
                <p className="text-foreground/90 leading-relaxed">{note.body}</p>
                <p className="text-[11px] text-muted-2 mt-0.5">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() =>
                  startTransition(() => {
                    deleteNoteAction(designId, note.id);
                  })
                }
                className="opacity-0 group-hover:opacity-100 text-muted-2 hover:text-danger transition-opacity text-xs shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
