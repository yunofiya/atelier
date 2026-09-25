# Atelier

A single-user production-pipeline tracker for a clothing brand — take a design from idea to launch.

- **Kanban dashboard** across 8 stages (Idea → Designing → Mockup → Techpack → Sourcing → Production → Finished → Launched), with drag-and-drop, search/filter, and a live summary bar
- **Design detail pages** — editable fields, image galleries (inspiration, sketches, mockups, techpacks), stage checklists with timestamps, notes, and stage history
- **Vendor quotes** — track multiple quotes per design, auto-highlight the best price, and get a suggested retail price from your target margin
- **Stall alerts** — configurable per-stage thresholds flag designs that have sat too long, plus overdue-quote warnings
- **Archive** — throw away or restore ideas without losing history
- Single-user email/password auth, dark Linear/Notion-style UI, fully responsive

## Stack

Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS v4 · SQLite (`better-sqlite3`) · `jose` + `bcryptjs` for auth · `@dnd-kit` for drag-and-drop

No external services or database server required — everything runs locally.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first run you'll be asked to create the single account for the app. Data is stored in a local SQLite file under `data/`, and uploaded images under `public/uploads/` — both are gitignored.
