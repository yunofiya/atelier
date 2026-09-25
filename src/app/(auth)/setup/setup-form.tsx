"use client";

import { useActionState } from "react";
import { setupAccount } from "@/app/actions/auth";

export default function SetupForm() {
  const [state, formAction, pending] = useActionState(setupAccount, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
      />
      <Field
        label="Confirm password"
        name="confirm"
        type="password"
        autoComplete="new-password"
        required
      />
      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft border border-danger/30 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 h-10 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-medium transition-colors"
      >
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}

function Field(props: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{props.label}</span>
      <input
        name={props.name}
        type={props.type}
        autoComplete={props.autoComplete}
        required={props.required}
        className="h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm outline-none focus:border-accent transition-colors"
      />
    </label>
  );
}
