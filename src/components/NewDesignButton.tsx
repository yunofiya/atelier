"use client";

import { useState } from "react";
import Modal from "./Modal";
import { createDesignAction } from "@/app/actions/designs";

export default function NewDesignButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-8 px-3 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors flex items-center gap-1.5"
      >
        <span className="text-sm leading-none">+</span>
        <span className="hidden sm:inline">New design</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="New design">
        <form action={createDesignAction} className="flex flex-col gap-4">
          <TextField label="Name" name="name" required autoFocus />
          <TextArea label="Description" name="description" rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Fabric / material" name="fabricNotes" />
            <TextField label="Size run" name="sizeRun" placeholder="XS–XL" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Colorways" name="colorways" placeholder="Black, Sand" />
            <TextField label="Tags" name="tags" placeholder="hoodie, drop-3" />
          </div>
          <button
            type="submit"
            className="mt-1 h-10 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            Create design
          </button>
        </form>
      </Modal>
    </>
  );
}

function TextField(props: {
  label: string;
  name: string;
  required?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{props.label}</span>
      <input
        name={props.name}
        required={props.required}
        autoFocus={props.autoFocus}
        placeholder={props.placeholder}
        className="h-9 rounded-lg bg-surface-2 border border-border px-3 text-sm outline-none focus:border-accent transition-colors"
      />
    </label>
  );
}

function TextArea(props: { label: string; name: string; rows?: number }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{props.label}</span>
      <textarea
        name={props.name}
        rows={props.rows ?? 3}
        className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent transition-colors resize-none"
      />
    </label>
  );
}
