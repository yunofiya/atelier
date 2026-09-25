"use server";

import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { getCurrentUser } from "@/lib/auth";
import * as repo from "@/lib/repo";
import { newId } from "@/lib/db";
import { Stage } from "@/lib/pipeline";

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

export async function uploadImageAction(designId: string, formData: FormData) {
  await requireAuth();
  const file = formData.get("file") as File | null;
  const category = String(formData.get("category") || "other");
  if (!file || file.size === 0) throw new Error("No file provided");
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error("Unsupported file type");
  if (file.size > 10 * 1024 * 1024) throw new Error("File too large (max 10MB)");

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const filename = `${newId()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(uploadDir, filename), buffer);

  repo.addImage(designId, `/uploads/${filename}`, category);
  revalidatePath(`/designs/${designId}`);
}

export async function deleteImageAction(designId: string, imageId: string) {
  await requireAuth();
  repo.deleteImage(imageId);
  revalidatePath(`/designs/${designId}`);
}

export async function addNoteAction(designId: string, formData: FormData) {
  await requireAuth();
  const body = String(formData.get("body") || "").trim();
  if (!body) return;
  repo.addNote(designId, body);
  revalidatePath(`/designs/${designId}`);
}

export async function deleteNoteAction(designId: string, noteId: string) {
  await requireAuth();
  repo.deleteNote(noteId);
  revalidatePath(`/designs/${designId}`);
}

export async function addQuoteAction(designId: string, formData: FormData) {
  await requireAuth();
  const vendorName = String(formData.get("vendorName") || "").trim();
  if (!vendorName) return;
  const priceRaw = String(formData.get("price") || "");
  const leadRaw = String(formData.get("leadTimeDays") || "");
  const moqRaw = String(formData.get("minOrderQty") || "");

  repo.addQuote(designId, {
    vendorName,
    price: priceRaw ? Number(priceRaw) : undefined,
    leadTimeDays: leadRaw ? Number(leadRaw) : undefined,
    minOrderQty: moqRaw ? Number(moqRaw) : undefined,
    notes: String(formData.get("notes") || "") || undefined,
    responded: priceRaw ? true : false,
  });
  revalidatePath(`/designs/${designId}`);
}

export async function pinBestQuoteAction(designId: string, quoteId: string) {
  await requireAuth();
  repo.pinBestQuote(designId, quoteId);
  revalidatePath(`/designs/${designId}`);
}

export async function deleteQuoteAction(designId: string, quoteId: string) {
  await requireAuth();
  repo.deleteQuote(quoteId);
  revalidatePath(`/designs/${designId}`);
}

export async function toggleChecklistAction(
  designId: string,
  itemId: string,
  done: boolean
) {
  await requireAuth();
  repo.toggleChecklistItem(itemId, done);
  revalidatePath(`/designs/${designId}`);
  revalidatePath("/");
}

export async function addChecklistItemAction(
  designId: string,
  stage: Stage,
  formData: FormData
) {
  await requireAuth();
  const label = String(formData.get("label") || "").trim();
  if (!label) return;
  repo.addChecklistItem(designId, stage, label);
  revalidatePath(`/designs/${designId}`);
}

export async function deleteChecklistItemAction(designId: string, itemId: string) {
  await requireAuth();
  repo.deleteChecklistItem(itemId);
  revalidatePath(`/designs/${designId}`);
}
