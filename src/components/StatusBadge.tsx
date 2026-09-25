import { Status, STATUS_LABEL } from "@/lib/pipeline";
import clsx from "clsx";

const STYLES: Record<Status, string> = {
  "on-track": "text-ok bg-ok-soft",
  pending: "text-warn bg-warn-soft",
  stalled: "text-danger bg-danger-soft",
};

export default function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        STYLES[status],
        className
      )}
    >
      <span
        className={clsx("h-1.5 w-1.5 rounded-full", {
          "bg-ok": status === "on-track",
          "bg-warn": status === "pending",
          "bg-danger": status === "stalled",
        })}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}
