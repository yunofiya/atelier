import * as repo from "@/lib/repo";
import ArchiveList from "./ArchiveList";

export default async function ArchivePage() {
  const all = repo.listDesigns(true).filter((d) => d.archived);

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Archive</h1>
      <p className="text-sm text-muted mt-0.5 mb-6">
        Ideas you threw away. Restore them or delete for good.
      </p>
      {all.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted">
          Nothing archived yet.
        </div>
      ) : (
        <ArchiveList designs={all} />
      )}
    </div>
  );
}
