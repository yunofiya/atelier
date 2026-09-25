"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm outline-none focus:border-accent transition-colors"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm outline-none focus:border-accent transition-colors"
        />
      </label>
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
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
