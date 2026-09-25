import { getEnrichedDesigns, summarize } from "@/lib/derived";
import SummaryBar from "@/components/SummaryBar";
import KanbanBoard from "@/components/KanbanBoard";

export default async function DashboardPage() {
  const designs = getEnrichedDesigns(false);
  const summary = summarize(designs);

  return (
    <div>
      <div className="mb-1">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted mt-0.5">
          Every design, from idea to launch. Drag a card to move its stage.
        </p>
      </div>
      <div className="h-5" />
      <SummaryBar {...summary} />
      {designs.length === 0 ? (
        <EmptyState />
      ) : (
        <KanbanBoard designs={designs} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border py-20 flex flex-col items-center gap-2 text-center">
      <p className="text-sm text-foreground/90 font-medium">No designs yet</p>
      <p className="text-sm text-muted max-w-sm">
        Start your first idea with the “New design” button up top — you can add
        inspiration, sketches, and mockups once it exists.
      </p>
    </div>
  );
}
