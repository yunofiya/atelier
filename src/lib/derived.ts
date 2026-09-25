import * as repo from "./repo";
import { computeStatus, daysBetween, Status } from "./pipeline";
import { pickBestQuote } from "./quotes";

export type EnrichedDesign = repo.Design & {
  daysInStage: number;
  status: Status;
  thumbnail: string | null;
  bestQuote: repo.QuoteRow | null;
  overdueQuote: boolean;
};

export function getEnrichedDesigns(includeArchived = false): EnrichedDesign[] {
  const settings = repo.getSettings();
  const thresholds = JSON.parse(settings.stallThresholds) as Record<string, number>;
  const designs = repo.listDesigns(includeArchived);
  const now = new Date();

  return designs.map((d) => {
    const daysInStage = daysBetween(new Date(d.stageEnteredAt), now);
    const threshold = thresholds[d.stage] ?? 14;
    const status = computeStatus(daysInStage, threshold);

    const images = repo.listImages(d.id);
    const thumbnail =
      images.find((i) => i.category === "mockup")?.url ??
      images.find((i) => i.category === "sketch")?.url ??
      images[0]?.url ??
      null;

    const quotes = repo.listQuotes(d.id);
    const bestQuote = pickBestQuote(quotes);

    let overdueQuote = false;
    if (d.stage === "sourcing") {
      overdueQuote = quotes.some(
        (q) => !q.respondedAt && daysBetween(new Date(q.requestedAt), now) >= settings.quoteOverdueDays
      );
    }

    return { ...d, daysInStage, status, thumbnail, bestQuote, overdueQuote };
  });
}

export function summarize(designs: EnrichedDesign[]) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const inProgress = designs.filter(
    (d) => d.stage !== "finished" && d.stage !== "launched"
  ).length;
  const stalled = designs.filter((d) => d.status === "stalled").length;
  const awaitingQuotes = designs.filter((d) => d.stage === "sourcing").length;
  const overdueQuotes = designs.filter((d) => d.overdueQuote).length;
  const finishedThisWeek = designs.filter(
    (d) =>
      (d.stage === "finished" || d.stage === "launched") &&
      new Date(d.stageEnteredAt) >= weekAgo
  ).length;

  return { inProgress, stalled, awaitingQuotes, overdueQuotes, finishedThisWeek, total: designs.length };
}
