"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { STAGES, Stage, Status } from "@/lib/pipeline";
import { Design } from "@/lib/repo";
import { moveStageAction, archiveDesignAction, deleteDesignAction } from "@/app/actions/designs";
import EditDesignModal from "./EditDesignModal";

export default function DesignHeader({
  design,
  status,
  daysInStage,
}: {
  design: Design;
  status: Status;
  daysInStage: number;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const archived = !!design.archived;

  function onStageChange(stage: Stage) {
    startTransition(() => {
      moveStageAction(design.id, stage);
    });
  }

  function onArchiveToggle() {
    startTransition(() => {
      archiveDesignAction(design.id, !archived);
    });
  }

  function onDelete() {
    if (!confirm(`Permanently delete "${design.name}"? This cannot be undone.`)) return;
    startTransition(() => {
      deleteDesignAction(design.id);
    });
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted mb-3">
        <Link href="/" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-foreground/80">{design.name}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight">{design.name}</h1>
            {archived && (
              <span className="text-[11px] rounded-full bg-surface-2 border border-border px-2 py-0.5 text-muted">
                Archived
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={status} />
            <span className="text-xs text-muted-2 tabular-nums">
              {daysInStage} day{daysInStage === 1 ? "" : "s"} in stage
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="h-8 px-3 rounded-lg text-xs font-medium border border-border hover:bg-surface-2 transition-colors"
          >
            Edit details
          </button>
          <button
            onClick={onArchiveToggle}
            disabled={pending}
            className="h-8 px-3 rounded-lg text-xs font-medium border border-border hover:bg-surface-2 transition-colors disabled:opacity-50"
          >
            {archived ? "Restore" : "Archive"}
          </button>
          {archived && (
            <button
              onClick={onDelete}
              disabled={pending}
              className="h-8 px-3 rounded-lg text-xs font-medium border border-danger/40 text-danger hover:bg-danger-soft transition-colors disabled:opacity-50"
            >
              Delete forever
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-1.5 flex-wrap">
        {STAGES.map((s) => (
          <button
            key={s.key}
            onClick={() => onStageChange(s.key)}
            disabled={pending}
            title={s.hint}
            className={`h-8 px-3 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
              design.stage === s.key
                ? "bg-accent border-accent text-white"
                : "border-border text-muted hover:text-foreground hover:bg-surface-2"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <EditDesignModal design={design} open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}
