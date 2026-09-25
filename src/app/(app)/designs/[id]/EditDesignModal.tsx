"use client";

import Modal from "@/components/Modal";
import { Design } from "@/lib/repo";
import { updateDesignAction } from "@/app/actions/designs";

export default function EditDesignModal({
  design,
  open,
  onClose,
}: {
  design: Design;
  open: boolean;
  onClose: () => void;
}) {
  const action = updateDesignAction.bind(null, design.id);

  return (
    <Modal open={open} onClose={onClose} title="Edit design" wide>
      <form
        action={async (formData: FormData) => {
          await action(formData);
          onClose();
        }}
        className="flex flex-col gap-4"
      >
        <Field label="Name" name="name" defaultValue={design.name} required />
        <TextArea label="Description" name="description" defaultValue={design.description ?? ""} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fabric / material" name="fabricNotes" defaultValue={design.fabricNotes ?? ""} />
          <Field label="Size run" name="sizeRun" defaultValue={design.sizeRun ?? ""} placeholder="XS–XL" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Colorways" name="colorways" defaultValue={design.colorways ?? ""} />
          <Field label="Tags" name="tags" defaultValue={design.tags ?? ""} />
        </div>
        <Field
          label="Target margin %"
          name="targetMarginPct"
          type="number"
          defaultValue={design.targetMarginPct != null ? String(design.targetMarginPct) : ""}
          placeholder="e.g. 65"
        />
        <button
          type="submit"
          className="mt-1 h-10 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          Save changes
        </button>
      </form>
    </Modal>
  );
}

function Field(props: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{props.label}</span>
      <input
        name={props.name}
        type={props.type ?? "text"}
        defaultValue={props.defaultValue}
        required={props.required}
        placeholder={props.placeholder}
        className="h-9 rounded-lg bg-surface-2 border border-border px-3 text-sm outline-none focus:border-accent transition-colors"
      />
    </label>
  );
}

function TextArea(props: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{props.label}</span>
      <textarea
        name={props.name}
        rows={3}
        defaultValue={props.defaultValue}
        className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent transition-colors resize-none"
      />
    </label>
  );
}
