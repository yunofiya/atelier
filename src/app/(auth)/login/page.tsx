import { redirect } from "next/navigation";
import { getUserCount } from "@/lib/auth";
import LoginForm from "./login-form";

export default async function LoginPage() {
  if (getUserCount() === 0) {
    redirect("/setup");
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-base font-medium mb-1">Welcome back</h2>
      <p className="text-sm text-muted mb-6">Sign in to your pipeline.</p>
      <LoginForm />
    </div>
  );
}
