"use client";

import { useState, useTransition } from "react";
import { ChecklistItemRow } from "@/lib/repo";
import { Stage, STAGE_LABELS } from "@/lib/pipeline";
import {
  toggleChecklistAction,
  addChecklistItemAction,
  deleteChecklistItemAction,
} from "@/app/actions/detail";

export default function ChecklistPanel({
  designId,
  currentStage,
  items,
}: {
  designId: string;
  currentStage: Stage;
  items: ChecklistItemRow[];
}) {
  const [, startTransition] = useTransition();
  const [newLabel, setNewLabel] = useState("");

  const byStage = new Map<string, ChecklistItemRow[]>();
  for (const item of items) {
    if (!byStage.has(item.stage)) byStage.set(item.stage, []);
    byStage.get(item.stage)!.push(item);
  }

  const addAction = addChecklistItemAction.bind(null, designId, currentStage);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-medium mb-4">Checklist</h2>

      <div className="flex flex-col gap-5">
        {Array.from(byStage.entries()).map(([stage, stageItems]) => (
          <div key={stage}>
            <div className="text-[11px] uppercase tracking-wide text-muted-2 mb-2 flex items-center gap-2">
              {STAGE_LABELS[stage as Stage] ?? stage}
              {stage === currentStage && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {stageItems.map((item) => (
                <ChecklistRow key={item.id} designId={designId} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <form
        action={async (formData: FormData) => {
          await addAction(formData);
          setNewLabel("");
        }}
        className="mt-4 pt-4 border-t border-border-soft flex gap-2"
      >
        <input
          name="label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder={`Add to ${STAGE_LABELS[currentStage]}…`}
          className="h-8 flex-1 rounded-lg bg-surface-2 border border-border px-2.5 text-xs outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          className="h-8 px-2.5 rounded-lg bg-surface-2 border border-border text-xs font-medium hover:bg-border transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
}

function ChecklistRow({ designId, item }: { designId: string; item: ChecklistItemRow }) {
  const [pending, startTransition] = useTransition();
  const done = !!item.done;

  return (
    <div className="group flex items-center gap-2 text-sm">
      <button
        onClick={() =>
          startTransition(() => {
            toggleChecklistAction(designId, item.id, !done);
          })
        }
        disabled={pending}
        className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
          done ? "bg-accent border-accent" : "border-border hover:border-accent"
        }`}
      >
        {done && <span className="text-white text-[10px] leading-none">✓</span>}
      </button>
      <span className={`flex-1 ${done ? "text-muted-2 line-through" : "text-foreground/90"}`}>
        {item.label}
      </span>
      {done && item.doneAt && (
        <span className="text-[10px] text-muted-2 hidden sm:inline">
          {new Date(item.doneAt).toLocaleDateString()}
        </span>
      )}
      <button
        onClick={() =>
          startTransition(() => {
            deleteChecklistItemAction(designId, item.id);
          })
        }
        className="opacity-0 group-hover:opacity-100 text-muted-2 hover:text-danger transition-opacity text-xs"
      >
        ✕
      </button>
    </div>
  );
}
