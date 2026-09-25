"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import * as repo from "@/lib/repo";
import { STAGES } from "@/lib/pipeline";

export async function updateSettingsAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const thresholds: Record<string, number> = {};
  for (const s of STAGES) {
    const raw = String(formData.get(`threshold_${s.key}`) || "");
    thresholds[s.key] = raw ? Number(raw) : 9999;
  }
  const quoteOverdueDays = Number(formData.get("quoteOverdueDays") || 7);

  repo.updateSettings(thresholds, quoteOverdueDays);
  revalidatePath("/settings");
  revalidatePath("/");
}
