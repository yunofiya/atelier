"use client";

import { useRef, useState, useTransition } from "react";
import { ImageRow } from "@/lib/repo";
import { uploadImageAction, deleteImageAction } from "@/app/actions/detail";

const CATEGORIES = [
  { key: "inspiration", label: "Inspiration" },
  { key: "sketch", label: "Sketches" },
  { key: "mockup", label: "Mockups" },
  { key: "techpack", label: "Techpacks" },
  { key: "other", label: "Other" },
];

export default function ImageGallery({
  designId,
  images,
}: {
  designId: string;
  images: ImageRow[];
}) {
  const [tab, setTab] = useState("inspiration");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const shown = images.filter((i) => i.category === tab);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    Array.from(files).forEach((file) => {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("category", tab);
      startTransition(async () => {
        try {
          await uploadImageAction(designId, fd);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Upload failed");
        }
      });
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex gap-1 bg-surface-2 border border-border rounded-lg p-1 overflow-x-auto min-w-0">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setTab(c.key)}
              className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
                tab === c.key ? "bg-surface text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {c.label}
              {images.filter((i) => i.category === c.key).length > 0 && (
                <span className="ml-1 text-muted-2">
                  {images.filter((i) => i.category === c.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <label className="h-8 px-3 rounded-lg border border-border hover:bg-surface-2 transition-colors text-xs font-medium cursor-pointer flex items-center gap-1.5 shrink-0">
          {pending ? "Uploading…" : "Upload"}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {error && (
        <p className="text-xs text-danger bg-danger-soft border border-danger/30 rounded-lg px-3 py-2 mb-3">
          {error}
        </p>
      )}

      {shown.length === 0 ? (
        <div className="text-xs text-muted-2 text-center py-10 border border-dashed border-border-soft rounded-lg">
          No {CATEGORIES.find((c) => c.key === tab)?.label.toLowerCase()} yet
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {shown.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square rounded-lg overflow-hidden bg-surface-2 border border-border-soft"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover cursor-pointer"
                onClick={() => setLightbox(img.url)}
              />
              <button
                onClick={() =>
                  startTransition(() => {
                    deleteImageAction(designId, img.id);
                  })
                }
                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-md bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
