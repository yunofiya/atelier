"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { STAGES, Stage } from "@/lib/pipeline";
import { EnrichedDesign } from "@/lib/derived";
import DesignCard from "./DesignCard";
import { moveStageAction } from "@/app/actions/designs";

export default function KanbanBoard({ designs }: { designs: EnrichedDesign[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "on-track" | "pending" | "stalled">(
    "all"
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [optimisticStage, setOptimisticStage] = useState<Record<string, Stage>>({});
  const [dndReady, setDndReady] = useState(false);

  useEffect(() => {
    setDndReady(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const filtered = useMemo(() => {
    return designs
      .map((d) => (optimisticStage[d.id] ? { ...d, stage: optimisticStage[d.id] } : d))
      .filter((d) => {
        if (statusFilter !== "all" && d.status !== statusFilter) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          (d.tags ?? "").toLowerCase().includes(q) ||
          (d.description ?? "").toLowerCase().includes(q)
        );
      });
  }, [designs, search, statusFilter, optimisticStage]);

  const byStage = useMemo(() => {
    const map: Record<string, EnrichedDesign[]> = {};
    for (const s of STAGES) map[s.key] = [];
    for (const d of filtered) {
      (map[d.stage] ??= []).push(d);
    }
    return map;
  }, [filtered]);

  const activeDesign = activeId ? designs.find((d) => d.id === activeId) ?? null : null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const designId = String(active.id);
    const newStage = String(over.id) as Stage;
    const design = designs.find((d) => d.id === designId);
    if (!design || design.stage === newStage) return;

    setOptimisticStage((prev) => ({ ...prev, [designId]: newStage }));
    startTransition(() => {
      moveStageAction(designId, newStage);
    });
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search designs, tags, notes…"
          className="h-9 flex-1 rounded-lg bg-surface border border-border px-3 text-sm outline-none focus:border-accent transition-colors"
        />
        <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
          {(["all", "on-track", "pending", "stalled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-surface-2 text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : s === "on-track" ? "On track" : s === "pending" ? "Pending" : "Stalled"}
            </button>
          ))}
        </div>
      </div>

      {dndReady ? (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {STAGES.map((stage) => (
              <Column key={stage.key} stage={stage.key} label={stage.label} count={byStage[stage.key].length}>
                {byStage[stage.key].map((d) => (
                  <DraggableCard key={d.id} design={d} />
                ))}
                {byStage[stage.key].length === 0 && (
                  <div className="text-xs text-muted-2 text-center py-6 border border-dashed border-border-soft rounded-lg">
                    Empty
                  </div>
                )}
              </Column>
            ))}
          </div>
          <DragOverlay>
            {activeDesign ? (
              <div className="w-72 rotate-2 opacity-90">
                <DesignCard design={activeDesign} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {STAGES.map((stage) => (
            <StaticColumn key={stage.key} label={stage.label} count={byStage[stage.key].length}>
              {byStage[stage.key].map((d) => (
                <DesignCard key={d.id} design={d} />
              ))}
              {byStage[stage.key].length === 0 && (
                <div className="text-xs text-muted-2 text-center py-6 border border-dashed border-border-soft rounded-lg">
                  Empty
                </div>
              )}
            </StaticColumn>
          ))}
        </div>
      )}
    </div>
  );
}

function StaticColumn({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="w-72 shrink-0 flex flex-col rounded-xl border border-border-soft">
      <div className="px-3 py-2.5 flex items-center justify-between sticky top-0">
        <span className="text-xs font-semibold text-foreground/90">{label}</span>
        <span className="text-[11px] text-muted-2 tabular-nums">{count}</span>
      </div>
      <div className="flex flex-col gap-2 px-2 pb-2 min-h-24">{children}</div>
    </div>
  );
}

function Column({
  stage,
  label,
  count,
  children,
}: {
  stage: Stage;
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`w-72 shrink-0 flex flex-col rounded-xl border transition-colors ${
        isOver ? "border-accent bg-accent-soft/30" : "border-border-soft bg-transparent"
      }`}
    >
      <div className="px-3 py-2.5 flex items-center justify-between sticky top-0">
        <span className="text-xs font-semibold text-foreground/90">{label}</span>
        <span className="text-[11px] text-muted-2 tabular-nums">{count}</span>
      </div>
      <div className="flex flex-col gap-2 px-2 pb-2 min-h-24">{children}</div>
    </div>
  );
}

function DraggableCard({ design }: { design: EnrichedDesign }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: design.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ touchAction: "none" }}
      className={isDragging ? "opacity-30" : ""}
    >
      <DesignCard design={design} />
    </div>
  );
}
