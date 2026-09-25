import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "app.db");

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

const db = global.__db ?? new Database(dbPath);
if (process.env.NODE_ENV !== "production") global.__db = db;

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS designs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  fabricNotes TEXT,
  colorways TEXT,
  sizeRun TEXT,
  tags TEXT,
  stage TEXT NOT NULL DEFAULT 'idea',
  stageEnteredAt TEXT NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0,
  archivedAt TEXT,
  targetMarginPct REAL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  designId TEXT NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  caption TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stage_events (
  id TEXT PRIMARY KEY,
  designId TEXT NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  enteredAt TEXT NOT NULL,
  exitedAt TEXT
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  designId TEXT NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  designId TEXT NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  vendorName TEXT NOT NULL,
  price REAL,
  leadTimeDays INTEGER,
  minOrderQty INTEGER,
  notes TEXT,
  pinnedBest INTEGER NOT NULL DEFAULT 0,
  requestedAt TEXT NOT NULL,
  respondedAt TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id TEXT PRIMARY KEY,
  designId TEXT NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  label TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  doneAt TEXT,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  stallThresholds TEXT NOT NULL,
  quoteOverdueDays INTEGER NOT NULL DEFAULT 7
);
`);

// seed default settings row
const settingsRow = db.prepare(`SELECT id FROM settings WHERE id = 'singleton'`).get();
if (!settingsRow) {
  db.prepare(
    `INSERT INTO settings (id, stallThresholds, quoteOverdueDays) VALUES ('singleton', ?, 7)`
  ).run(
    JSON.stringify({
      idea: 14,
      designing: 10,
      mockup: 10,
      techpack: 7,
      sourcing: 10,
      production: 21,
      finished: 30,
      launched: 9999,
    })
  );
}

export function newId() {
  return nanoid();
}

export default db;
