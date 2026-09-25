import { STAGE_LABELS, Stage, daysBetween } from "@/lib/pipeline";

type StageEvent = {
  id: string;
  stage: Stage;
  enteredAt: string;
  exitedAt: string | null;
};

export default function StageTimeline({ events }: { events: StageEvent[] }) {
  const ordered = [...events].reverse();

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-medium mb-4">Stage history</h2>
      <div className="flex flex-col gap-3">
        {ordered.map((e) => {
          const end = e.exitedAt ? new Date(e.exitedAt) : new Date();
          const duration = daysBetween(new Date(e.enteredAt), end);
          return (
            <div key={e.id} className="flex items-start gap-3 text-sm">
              <div className="flex flex-col items-center pt-1">
                <div
                  className={`h-2 w-2 rounded-full ${
                    e.exitedAt ? "bg-muted-2" : "bg-accent"
                  }`}
                />
                <div className="w-px flex-1 bg-border-soft mt-1" style={{ minHeight: 16 }} />
              </div>
              <div className="pb-1">
                <div className="text-foreground/90">{STAGE_LABELS[e.stage] ?? e.stage}</div>
                <div className="text-[11px] text-muted-2">
                  {new Date(e.enteredAt).toLocaleDateString()} · {duration}d
                  {!e.exitedAt ? " (current)" : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
