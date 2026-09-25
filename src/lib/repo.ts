import db, { newId } from "./db";
import { DEFAULT_CHECKLISTS, Stage } from "./pipeline";

export type Design = {
  id: string;
  name: string;
  description: string | null;
  fabricNotes: string | null;
  colorways: string | null;
  sizeRun: string | null;
  tags: string | null;
  stage: Stage;
  stageEnteredAt: string;
  archived: number;
  archivedAt: string | null;
  targetMarginPct: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ImageRow = {
  id: string;
  designId: string;
  url: string;
  category: string;
  caption: string | null;
  createdAt: string;
};

export type NoteRow = {
  id: string;
  designId: string;
  body: string;
  createdAt: string;
};

export type QuoteRow = {
  id: string;
  designId: string;
  vendorName: string;
  price: number | null;
  leadTimeDays: number | null;
  minOrderQty: number | null;
  notes: string | null;
  pinnedBest: number;
  requestedAt: string;
  respondedAt: string | null;
  createdAt: string;
};

export type ChecklistItemRow = {
  id: string;
  designId: string;
  stage: Stage;
  label: string;
  done: number;
  doneAt: string | null;
  sortOrder: number;
  createdAt: string;
};

export type SettingsRow = {
  id: string;
  stallThresholds: string;
  quoteOverdueDays: number;
};

const now = () => new Date().toISOString();

// ---------- Designs ----------

export function listDesigns(includeArchived = false): Design[] {
  const sql = includeArchived
    ? `SELECT * FROM designs ORDER BY updatedAt DESC`
    : `SELECT * FROM designs WHERE archived = 0 ORDER BY updatedAt DESC`;
  return db.prepare(sql).all() as Design[];
}

export function getDesign(id: string): Design | undefined {
  return db.prepare(`SELECT * FROM designs WHERE id = ?`).get(id) as Design | undefined;
}

export function createDesign(input: {
  name: string;
  description?: string;
  fabricNotes?: string;
  colorways?: string;
  sizeRun?: string;
  tags?: string;
  targetMarginPct?: number;
}): Design {
  const id = newId();
  const ts = now();
  db.prepare(
    `INSERT INTO designs (id, name, description, fabricNotes, colorways, sizeRun, tags, stage, stageEnteredAt, archived, targetMarginPct, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'idea', ?, 0, ?, ?, ?)`
  ).run(
    id,
    input.name,
    input.description ?? null,
    input.fabricNotes ?? null,
    input.colorways ?? null,
    input.sizeRun ?? null,
    input.tags ?? null,
    ts,
    input.targetMarginPct ?? null,
    ts,
    ts
  );

  db.prepare(
    `INSERT INTO stage_events (id, designId, stage, enteredAt) VALUES (?, ?, 'idea', ?)`
  ).run(newId(), id, ts);

  const seedItems = DEFAULT_CHECKLISTS.idea;
  const insertItem = db.prepare(
    `INSERT INTO checklist_items (id, designId, stage, label, done, sortOrder, createdAt) VALUES (?, ?, 'idea', ?, 0, ?, ?)`
  );
  seedItems.forEach((label, i) => insertItem.run(newId(), id, label, i, ts));

  return getDesign(id)!;
}

export function updateDesign(
  id: string,
  fields: Partial<
    Pick<
      Design,
      | "name"
      | "description"
      | "fabricNotes"
      | "colorways"
      | "sizeRun"
      | "tags"
      | "targetMarginPct"
    >
  >
) {
  const existing = getDesign(id);
  if (!existing) return;
  const merged = { ...existing, ...fields };
  db.prepare(
    `UPDATE designs SET name=?, description=?, fabricNotes=?, colorways=?, sizeRun=?, tags=?, targetMarginPct=?, updatedAt=? WHERE id=?`
  ).run(
    merged.name,
    merged.description,
    merged.fabricNotes,
    merged.colorways,
    merged.sizeRun,
    merged.tags,
    merged.targetMarginPct,
    now(),
    id
  );
}

export function moveStage(id: string, newStage: Stage) {
  const design = getDesign(id);
  if (!design) return;
  const ts = now();

  db.prepare(
    `UPDATE stage_events SET exitedAt = ? WHERE designId = ? AND exitedAt IS NULL`
  ).run(ts, id);

  db.prepare(
    `INSERT INTO stage_events (id, designId, stage, enteredAt) VALUES (?, ?, ?, ?)`
  ).run(newId(), id, newStage, ts);

  db.prepare(`UPDATE designs SET stage=?, stageEnteredAt=?, updatedAt=? WHERE id=?`).run(
    newStage,
    ts,
    ts,
    id
  );

  const existingCount = db
    .prepare(`SELECT COUNT(*) as c FROM checklist_items WHERE designId = ? AND stage = ?`)
    .get(id, newStage) as { c: number };
  if (existingCount.c === 0) {
    const seedItems = DEFAULT_CHECKLISTS[newStage] ?? [];
    const insertItem = db.prepare(
      `INSERT INTO checklist_items (id, designId, stage, label, done, sortOrder, createdAt) VALUES (?, ?, ?, ?, 0, ?, ?)`
    );
    seedItems.forEach((label, i) => insertItem.run(newId(), id, newStage, label, i, ts));
  }
}

export function setArchived(id: string, archived: boolean) {
  db.prepare(`UPDATE designs SET archived=?, archivedAt=?, updatedAt=? WHERE id=?`).run(
    archived ? 1 : 0,
    archived ? now() : null,
    now(),
    id
  );
}

export function deleteDesignPermanently(id: string) {
  const design = getDesign(id);
  if (design) {
    const images = listImages(id);
    for (const img of images) {
      deleteUploadedFile(img.url);
    }
  }
  db.prepare(`DELETE FROM designs WHERE id = ?`).run(id);
}

function deleteUploadedFile(url: string) {
  try {
    if (!url.startsWith("/uploads/")) return;
    const fs = require("fs") as typeof import("fs");
    const path = require("path") as typeof import("path");
    const filePath = path.join(process.cwd(), "public", url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // best effort
  }
}

// ---------- Images ----------

export function listImages(designId: string): ImageRow[] {
  return db
    .prepare(`SELECT * FROM images WHERE designId = ? ORDER BY createdAt DESC`)
    .all(designId) as ImageRow[];
}

export function addImage(designId: string, url: string, category: string, caption?: string) {
  const id = newId();
  db.prepare(
    `INSERT INTO images (id, designId, url, category, caption, createdAt) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, designId, url, category, caption ?? null, now());
  db.prepare(`UPDATE designs SET updatedAt=? WHERE id=?`).run(now(), designId);
  return id;
}

export function deleteImage(id: string) {
  const img = db.prepare(`SELECT * FROM images WHERE id = ?`).get(id) as ImageRow | undefined;
  if (img) deleteUploadedFile(img.url);
  db.prepare(`DELETE FROM images WHERE id = ?`).run(id);
}

// ---------- Notes ----------

export function listNotes(designId: string): NoteRow[] {
  return db
    .prepare(`SELECT * FROM notes WHERE designId = ? ORDER BY createdAt DESC`)
    .all(designId) as NoteRow[];
}

export function addNote(designId: string, body: string) {
  db.prepare(`INSERT INTO notes (id, designId, body, createdAt) VALUES (?, ?, ?, ?)`).run(
    newId(),
    designId,
    body,
    now()
  );
  db.prepare(`UPDATE designs SET updatedAt=? WHERE id=?`).run(now(), designId);
}

export function deleteNote(id: string) {
  db.prepare(`DELETE FROM notes WHERE id = ?`).run(id);
}

// ---------- Quotes ----------

export function listQuotes(designId: string): QuoteRow[] {
  return db
    .prepare(`SELECT * FROM quotes WHERE designId = ? ORDER BY createdAt DESC`)
    .all(designId) as QuoteRow[];
}

export function addQuote(
  designId: string,
  input: {
    vendorName: string;
    price?: number;
    leadTimeDays?: number;
    minOrderQty?: number;
    notes?: string;
    responded?: boolean;
  }
) {
  const ts = now();
  db.prepare(
    `INSERT INTO quotes (id, designId, vendorName, price, leadTimeDays, minOrderQty, notes, pinnedBest, requestedAt, respondedAt, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`
  ).run(
    newId(),
    designId,
    input.vendorName,
    input.price ?? null,
    input.leadTimeDays ?? null,
    input.minOrderQty ?? null,
    input.notes ?? null,
    ts,
    input.responded ? ts : null,
    ts
  );
  db.prepare(`UPDATE designs SET updatedAt=? WHERE id=?`).run(ts, designId);
}

export function pinBestQuote(designId: string, quoteId: string) {
  db.prepare(`UPDATE quotes SET pinnedBest = 0 WHERE designId = ?`).run(designId);
  db.prepare(`UPDATE quotes SET pinnedBest = 1 WHERE id = ?`).run(quoteId);
}

export function deleteQuote(id: string) {
  db.prepare(`DELETE FROM quotes WHERE id = ?`).run(id);
}

// ---------- Checklist ----------

export function listChecklist(designId: string, stage?: Stage): ChecklistItemRow[] {
  const sql = stage
    ? `SELECT * FROM checklist_items WHERE designId = ? AND stage = ? ORDER BY sortOrder ASC`
    : `SELECT * FROM checklist_items WHERE designId = ? ORDER BY stage ASC, sortOrder ASC`;
  return stage
    ? (db.prepare(sql).all(designId, stage) as ChecklistItemRow[])
    : (db.prepare(sql).all(designId) as ChecklistItemRow[]);
}

export function toggleChecklistItem(id: string, done: boolean) {
  db.prepare(`UPDATE checklist_items SET done=?, doneAt=? WHERE id=?`).run(
    done ? 1 : 0,
    done ? now() : null,
    id
  );
}

export function addChecklistItem(designId: string, stage: Stage, label: string) {
  const maxOrder = db
    .prepare(
      `SELECT COALESCE(MAX(sortOrder), -1) as m FROM checklist_items WHERE designId = ? AND stage = ?`
    )
    .get(designId, stage) as { m: number };
  db.prepare(
    `INSERT INTO checklist_items (id, designId, stage, label, done, sortOrder, createdAt) VALUES (?, ?, ?, ?, 0, ?, ?)`
  ).run(newId(), designId, stage, label, maxOrder.m + 1, now());
}

export function deleteChecklistItem(id: string) {
  db.prepare(`DELETE FROM checklist_items WHERE id = ?`).run(id);
}

// ---------- Settings ----------

export function getSettings(): SettingsRow {
  return db.prepare(`SELECT * FROM settings WHERE id = 'singleton'`).get() as SettingsRow;
}

export function updateSettings(stallThresholds: Record<string, number>, quoteOverdueDays: number) {
  db.prepare(`UPDATE settings SET stallThresholds=?, quoteOverdueDays=? WHERE id='singleton'`).run(
    JSON.stringify(stallThresholds),
    quoteOverdueDays
  );
}

// ---------- Stage history ----------

export function listStageEvents(designId: string) {
  return db
    .prepare(`SELECT * FROM stage_events WHERE designId = ? ORDER BY enteredAt ASC`)
    .all(designId) as { id: string; designId: string; stage: Stage; enteredAt: string; exitedAt: string | null }[];
}
