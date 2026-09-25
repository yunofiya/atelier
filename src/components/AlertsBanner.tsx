import Link from "next/link";
import { getEnrichedDesigns } from "@/lib/derived";
import { STAGE_LABELS } from "@/lib/pipeline";

export default async function AlertsBanner() {
  const designs = getEnrichedDesigns();
  const stalled = designs.filter((d) => d.status === "stalled");
  const overdue = designs.filter((d) => d.overdueQuote);

  if (stalled.length === 0 && overdue.length === 0) return null;

  return (
    <div className="border-b border-danger/25 bg-danger-soft">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        {stalled.length > 0 && (
          <span className="flex items-center gap-2 text-danger">
            <span className="h-1.5 w-1.5 rounded-full bg-danger" />
            {stalled.length} stalled:{" "}
            <span className="text-foreground/90">
              {stalled.slice(0, 3).map((d, i) => (
                <span key={d.id}>
                  <Link href={`/designs/${d.id}`} className="underline underline-offset-2 hover:text-accent">
                    {d.name}
                  </Link>
                  <span className="text-muted"> ({STAGE_LABELS[d.stage]})</span>
                  {i < Math.min(stalled.length, 3) - 1 ? ", " : ""}
                </span>
              ))}
              {stalled.length > 3 ? ` +${stalled.length - 3} more` : ""}
            </span>
          </span>
        )}
        {overdue.length > 0 && (
          <span className="flex items-center gap-2 text-warn">
            <span className="h-1.5 w-1.5 rounded-full bg-warn" />
            {overdue.length} quote{overdue.length > 1 ? "s" : ""} overdue
          </span>
        )}
      </div>
    </div>
  );
}
