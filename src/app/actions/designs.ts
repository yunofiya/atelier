"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import * as repo from "@/lib/repo";
import { Stage } from "@/lib/pipeline";

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function createDesignAction(formData: FormData) {
  await requireAuth();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Name is required");

  const design = repo.createDesign({
    name,
    description: String(formData.get("description") || "") || undefined,
    fabricNotes: String(formData.get("fabricNotes") || "") || undefined,
    colorways: String(formData.get("colorways") || "") || undefined,
    sizeRun: String(formData.get("sizeRun") || "") || undefined,
    tags: String(formData.get("tags") || "") || undefined,
  });

  revalidatePath("/");
  redirect(`/designs/${design.id}`);
}

export async function updateDesignAction(designId: string, formData: FormData) {
  await requireAuth();
  const targetMarginRaw = String(formData.get("targetMarginPct") || "");
  repo.updateDesign(designId, {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "") || undefined,
    fabricNotes: String(formData.get("fabricNotes") || "") || undefined,
    colorways: String(formData.get("colorways") || "") || undefined,
    sizeRun: String(formData.get("sizeRun") || "") || undefined,
    tags: String(formData.get("tags") || "") || undefined,
    targetMarginPct: targetMarginRaw ? Number(targetMarginRaw) : undefined,
  });
  revalidatePath(`/designs/${designId}`);
  revalidatePath("/");
}

export async function moveStageAction(designId: string, stage: Stage) {
  await requireAuth();
  repo.moveStage(designId, stage);
  revalidatePath("/");
  revalidatePath(`/designs/${designId}`);
}

export async function archiveDesignAction(designId: string, archived: boolean) {
  await requireAuth();
  repo.setArchived(designId, archived);
  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath(`/designs/${designId}`);
}

export async function deleteDesignAction(designId: string) {
  await requireAuth();
  repo.deleteDesignPermanently(designId);
  revalidatePath("/");
  revalidatePath("/archive");
  redirect("/archive");
}
