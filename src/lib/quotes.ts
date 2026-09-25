import type { QuoteRow } from "./repo";

export function pickBestQuote(quotes: QuoteRow[]): QuoteRow | null {
  if (quotes.length === 0) return null;
  const pinned = quotes.find((q) => q.pinnedBest);
  if (pinned) return pinned;
  const priced = quotes.filter((q) => q.price != null);
  if (priced.length === 0) return null;
  return priced.reduce((best, q) => (q.price! < best.price! ? q : best));
}

export function suggestedRetailPrice(cost: number, marginPct: number): number {
  if (marginPct <= 0 || marginPct >= 100) return cost;
  return cost / (1 - marginPct / 100);
}
