import Link from "next/link";
import StatusBadge from "./StatusBadge";
import { EnrichedDesign } from "@/lib/derived";

export default function DesignCard({ design }: { design: EnrichedDesign }) {
  const tags = (design.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <Link
      href={`/designs/${design.id}`}
      className="group block rounded-xl border border-border bg-surface hover:border-accent/50 transition-colors overflow-hidden"
    >
      <div className="aspect-[4/3] bg-surface-2 relative overflow-hidden">
        {design.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={design.thumbnail}
            alt={design.name}
            className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-2 text-xs">
            No image yet
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-snug line-clamp-2">{design.name}</h3>
        </div>
        <div className="flex items-center justify-between">
          <StatusBadge status={design.status} />
          <span className="text-[11px] text-muted-2 tabular-nums">
            {design.daysInStage}d in stage
          </span>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-[10px] rounded-full bg-surface-2 border border-border-soft px-1.5 py-0.5 text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
