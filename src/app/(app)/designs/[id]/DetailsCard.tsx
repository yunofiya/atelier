import { Design } from "@/lib/repo";

export default function DetailsCard({ design }: { design: Design }) {
  const tags = (design.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  const colorways = (design.colorways ?? "").split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      {design.description ? (
        <p className="text-sm text-foreground/90 leading-relaxed mb-4">{design.description}</p>
      ) : (
        <p className="text-sm text-muted-2 italic mb-4">No description yet.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <Info label="Fabric / material" value={design.fabricNotes} />
        <Info label="Size run" value={design.sizeRun} />
        <Info
          label="Colorways"
          value={colorways.length ? colorways.join(", ") : null}
        />
        <Info
          label="Target margin"
          value={design.targetMarginPct != null ? `${design.targetMarginPct}%` : null}
        />
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border-soft">
          {tags.map((t) => (
            <span
              key={t}
              className="text-[11px] rounded-full bg-surface-2 border border-border-soft px-2 py-0.5 text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-[11px] text-muted-2 uppercase tracking-wide mb-1">{label}</div>
      <div className={value ? "text-foreground/90" : "text-muted-2 italic"}>
        {value || "—"}
      </div>
    </div>
  );
}
