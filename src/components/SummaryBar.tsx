export default function SummaryBar({
  inProgress,
  stalled,
  awaitingQuotes,
  overdueQuotes,
  finishedThisWeek,
}: {
  inProgress: number;
  stalled: number;
  awaitingQuotes: number;
  overdueQuotes: number;
  finishedThisWeek: number;
}) {
  const items = [
    { label: "In progress", value: inProgress, tone: "neutral" as const },
    { label: "Stalled", value: stalled, tone: stalled > 0 ? ("danger" as const) : ("neutral" as const) },
    { label: "Awaiting quotes", value: awaitingQuotes, tone: "neutral" as const },
    {
      label: "Quotes overdue",
      value: overdueQuotes,
      tone: overdueQuotes > 0 ? ("warn" as const) : ("neutral" as const),
    },
    { label: "Finished this week", value: finishedThisWeek, tone: "ok" as const },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-surface px-4 py-3"
        >
          <div
            className={
              "text-2xl font-semibold tabular-nums " +
              (item.tone === "danger"
                ? "text-danger"
                : item.tone === "warn"
                ? "text-warn"
                : item.tone === "ok"
                ? "text-ok"
                : "text-foreground")
            }
          >
            {item.value}
          </div>
          <div className="text-xs text-muted mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
