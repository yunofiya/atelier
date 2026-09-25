import { notFound } from "next/navigation";
import * as repo from "@/lib/repo";
import { computeStatus, daysBetween } from "@/lib/pipeline";
import { getSettings } from "@/lib/repo";
import DesignHeader from "./DesignHeader";
import ImageGallery from "./ImageGallery";
import ChecklistPanel from "./ChecklistPanel";
import NotesPanel from "./NotesPanel";
import QuotesPanel from "./QuotesPanel";
import DetailsCard from "./DetailsCard";
import StageTimeline from "./StageTimeline";

export default async function DesignDetailPage(props: PageProps<"/designs/[id]">) {
  const { id } = await props.params;
  const design = repo.getDesign(id);
  if (!design) notFound();

  const settings = getSettings();
  const thresholds = JSON.parse(settings.stallThresholds) as Record<string, number>;
  const daysInStage = daysBetween(new Date(design.stageEnteredAt), new Date());
  const status = computeStatus(daysInStage, thresholds[design.stage] ?? 14);

  const images = repo.listImages(id);
  const notes = repo.listNotes(id);
  const quotes = repo.listQuotes(id);
  const checklist = repo.listChecklist(id);
  const stageEvents = repo.listStageEvents(id);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <DesignHeader design={design} status={status} daysInStage={daysInStage} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <DetailsCard design={design} />
          <ImageGallery designId={id} images={images} />
          <QuotesPanel designId={id} quotes={quotes} targetMarginPct={design.targetMarginPct} />
          <NotesPanel designId={id} notes={notes} />
        </div>
        <div className="flex flex-col gap-6">
          <ChecklistPanel designId={id} currentStage={design.stage} items={checklist} />
          <StageTimeline events={stageEvents} />
        </div>
      </div>
    </div>
  );
}
