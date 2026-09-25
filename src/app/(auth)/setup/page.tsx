import { redirect } from "next/navigation";
import { getUserCount } from "@/lib/auth";
import SetupForm from "./setup-form";

export default async function SetupPage() {
  if (getUserCount() > 0) {
    redirect("/login");
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-base font-medium mb-1">Create your account</h2>
      <p className="text-sm text-muted mb-6">
        This app is single-user. Set up the one account that can sign in.
      </p>
      <SetupForm />
    </div>
  );
}
