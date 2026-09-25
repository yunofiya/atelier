import { getSettings } from "@/lib/repo";
import { STAGES } from "@/lib/pipeline";
import { updateSettingsAction } from "@/app/actions/settings";

export default async function SettingsPage() {
  const settings = getSettings();
  const thresholds = JSON.parse(settings.stallThresholds) as Record<string, number>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      <p className="text-sm text-muted mt-0.5 mb-6">
        Configure when a design gets flagged as stalled or a quote as overdue.
      </p>

      <form action={updateSettingsAction} className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-medium mb-1">Stall thresholds</h2>
          <p className="text-xs text-muted mb-4">
            Days a design can sit in a stage before it's flagged stalled.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STAGES.map((s) => (
              <label key={s.key} className="flex flex-col gap-1.5">
                <span className="text-xs text-muted">{s.label}</span>
                <input
                  name={`threshold_${s.key}`}
                  type="number"
                  min={1}
                  defaultValue={thresholds[s.key] ?? 14}
                  className="h-9 rounded-lg bg-surface-2 border border-border px-3 text-sm outline-none focus:border-accent transition-colors"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-medium mb-1">Quotes</h2>
          <p className="text-xs text-muted mb-4">
            Flag a vendor quote as overdue if there's no response after this many days.
          </p>
          <label className="flex flex-col gap-1.5 max-w-40">
            <span className="text-xs text-muted">Overdue after (days)</span>
            <input
              name="quoteOverdueDays"
              type="number"
              min={1}
              defaultValue={settings.quoteOverdueDays}
              className="h-9 rounded-lg bg-surface-2 border border-border px-3 text-sm outline-none focus:border-accent transition-colors"
            />
          </label>
        </div>

        <button
          type="submit"
          className="self-start h-10 px-4 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          Save settings
        </button>
      </form>
    </div>
  );
}
