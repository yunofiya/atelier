"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Design } from "@/lib/repo";
import { STAGE_LABELS, Stage } from "@/lib/pipeline";
import { archiveDesignAction, deleteDesignAction } from "@/app/actions/designs";

export default function ArchiveList({ designs }: { designs: Design[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2">
      {designs.map((d) => (
        <div
          key={d.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
        >
          <div>
            <Link href={`/designs/${d.id}`} className="text-sm font-medium hover:text-accent transition-colors">
              {d.name}
            </Link>
            <div className="text-xs text-muted-2 mt-0.5">
              Was in {STAGE_LABELS[d.stage as Stage] ?? d.stage} · archived{" "}
              {d.archivedAt ? new Date(d.archivedAt).toLocaleDateString() : ""}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              disabled={pending}
              onClick={() =>
                startTransition(() => {
                  archiveDesignAction(d.id, false);
                })
              }
              className="h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-surface-2 transition-colors disabled:opacity-50"
            >
              Restore
            </button>
            <button
              disabled={pending}
              onClick={() => {
                if (!confirm(`Permanently delete "${d.name}"? This cannot be undone.`)) return;
                startTransition(() => {
                  deleteDesignAction(d.id);
                });
              }}
              className="h-8 px-3 rounded-lg border border-danger/40 text-danger text-xs font-medium hover:bg-danger-soft transition-colors disabled:opacity-50"
            >
              Delete forever
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
