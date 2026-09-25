export type Stage =
  | "idea"
  | "designing"
  | "mockup"
  | "techpack"
  | "sourcing"
  | "production"
  | "finished"
  | "launched";

export const STAGES: { key: Stage; label: string; hint: string }[] = [
  { key: "idea", label: "Idea", hint: "Inspiration & concept" },
  { key: "designing", label: "Designing", hint: "Sketches & direction" },
  { key: "mockup", label: "Mockup", hint: "Digital / physical mockup" },
  { key: "techpack", label: "Techpack", hint: "Spec sheet ready" },
  { key: "sourcing", label: "Sourcing", hint: "Awaiting vendor quotes" },
  { key: "production", label: "Production", hint: "In manufacturing" },
  { key: "finished", label: "Finished", hint: "Ready to sell" },
  { key: "launched", label: "Launched", hint: "Live / selling" },
];

export const STAGE_LABELS: Record<Stage, string> = STAGES.reduce(
  (acc, s) => ({ ...acc, [s.key]: s.label }),
  {} as Record<Stage, string>
);

export const DEFAULT_CHECKLISTS: Record<Stage, string[]> = {
  idea: ["Concept written down", "Moodboard started", "Reference gathered"],
  designing: ["Sketch finalized", "Colorways picked"],
  mockup: ["Digital mockup made", "Mockup reviewed"],
  techpack: ["Measurements set", "Techpack exported", "Materials listed"],
  sourcing: ["Vendors contacted", "Quotes received", "Vendor selected"],
  production: ["Deposit paid", "Production confirmed", "Sample approved"],
  finished: ["Quality checked", "Photos taken", "Listing ready"],
  launched: ["Posted to Instagram", "Store listing live"],
};

export type Status = "on-track" | "pending" | "stalled";

export function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function computeStatus(daysInStage: number, threshold: number): Status {
  if (daysInStage >= threshold) return "stalled";
  if (daysInStage >= threshold * 0.6) return "pending";
  return "on-track";
}

export const STATUS_LABEL: Record<Status, string> = {
  "on-track": "On track",
  pending: "Pending",
  stalled: "Stalled",
};
