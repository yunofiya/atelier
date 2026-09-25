"use client";

import { useState, useTransition } from "react";
import { QuoteRow } from "@/lib/repo";
import { pickBestQuote, suggestedRetailPrice } from "@/lib/quotes";
import {
  addQuoteAction,
  pinBestQuoteAction,
  deleteQuoteAction,
} from "@/app/actions/detail";

export default function QuotesPanel({
  designId,
  quotes,
  targetMarginPct,
}: {
  designId: string;
  quotes: QuoteRow[];
  targetMarginPct: number | null;
}) {
  const [, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [margin, setMargin] = useState(targetMarginPct ?? 65);
  const addAction = addQuoteAction.bind(null, designId);
  const best = pickBestQuote(quotes);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium">Vendor quotes</h2>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="h-7 px-2.5 rounded-lg border border-border text-xs font-medium hover:bg-surface-2 transition-colors"
        >
          {formOpen ? "Cancel" : "Add quote"}
        </button>
      </div>

      {formOpen && (
        <form
          action={async (fd: FormData) => {
            await addAction(fd);
            setFormOpen(false);
          }}
          className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-lg bg-surface-2 border border-border-soft"
        >
          <input
            name="vendorName"
            placeholder="Vendor name"
            required
            className="h-8 col-span-2 rounded-md bg-surface border border-border px-2.5 text-xs outline-none focus:border-accent"
          />
          <input
            name="price"
            type="number"
            step="0.01"
            placeholder="Unit price ($)"
            className="h-8 rounded-md bg-surface border border-border px-2.5 text-xs outline-none focus:border-accent"
          />
          <input
            name="leadTimeDays"
            type="number"
            placeholder="Lead time (days)"
            className="h-8 rounded-md bg-surface border border-border px-2.5 text-xs outline-none focus:border-accent"
          />
          <input
            name="minOrderQty"
            type="number"
            placeholder="Min order qty"
            className="h-8 rounded-md bg-surface border border-border px-2.5 text-xs outline-none focus:border-accent"
          />
          <input
            name="notes"
            placeholder="Notes"
            className="h-8 rounded-md bg-surface border border-border px-2.5 text-xs outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="col-span-2 h-8 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-medium mt-1"
          >
            Save quote
          </button>
        </form>
      )}

      {quotes.length === 0 ? (
        <p className="text-xs text-muted-2 italic">No quotes yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {quotes.map((q) => {
            const isBest = best?.id === q.id;
            return (
              <div
                key={q.id}
                className={`group rounded-lg border p-3 text-sm ${
                  isBest ? "border-ok/40 bg-ok-soft" : "border-border-soft"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{q.vendorName}</span>
                    {isBest && (
                      <span className="text-[10px] rounded-full bg-ok text-black/80 px-1.5 py-0.5 font-semibold">
                        BEST
                      </span>
                    )}
                    {!q.respondedAt && (
                      <span className="text-[10px] rounded-full bg-warn-soft text-warn px-1.5 py-0.5">
                        Awaiting response
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isBest && (
                      <button
                        onClick={() =>
                          startTransition(() => {
                            pinBestQuoteAction(designId, q.id);
                          })
                        }
                        className="text-[11px] text-muted hover:text-accent"
                      >
                        Pin best
                      </button>
                    )}
                    <button
                      onClick={() =>
                        startTransition(() => {
                          deleteQuoteAction(designId, q.id);
                        })
                      }
                      className="text-muted-2 hover:text-danger text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-muted">
                  {q.price != null && <span>${q.price.toFixed(2)} / unit</span>}
                  {q.leadTimeDays != null && <span>{q.leadTimeDays}d lead time</span>}
                  {q.minOrderQty != null && <span>MOQ {q.minOrderQty}</span>}
                </div>
                {q.notes && <p className="text-xs text-muted mt-1.5">{q.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {best?.price != null && (
        <div className="mt-4 pt-4 border-t border-border-soft">
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            <span>Suggested retail price</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-14 h-6 rounded bg-surface-2 border border-border px-1.5 text-xs text-right outline-none focus:border-accent"
              />
              <span>% margin</span>
            </div>
          </div>
          <div className="text-2xl font-semibold tabular-nums">
            ${suggestedRetailPrice(best.price, margin).toFixed(2)}
          </div>
          <div className="text-[11px] text-muted-2 mt-1">
            Based on {best.vendorName} at ${best.price.toFixed(2)}/unit
          </div>
        </div>
      )}
    </div>
  );
}
