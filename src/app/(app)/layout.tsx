import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import AlertsBanner from "@/components/AlertsBanner";
import NewDesignButton from "@/components/NewDesignButton";
import MobileMenu from "@/components/MobileMenu";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-lg bg-accent-soft border border-border flex items-center justify-center text-accent font-semibold text-sm">
              A
            </div>
            <span className="font-medium text-sm tracking-tight hidden sm:inline">
              Atelier
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1 text-sm">
            <NavLink href="/">Dashboard</NavLink>
            <NavLink href="/archive">Archive</NavLink>
            <NavLink href="/settings">Settings</NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <NewDesignButton />
            <form action={logout} className="hidden sm:block">
              <button
                type="submit"
                className="h-8 px-3 rounded-lg text-xs text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
              >
                Sign out
              </button>
            </form>
            <MobileMenu />
          </div>
        </div>
      </header>

      <AlertsBanner />

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="h-8 px-3 rounded-lg flex items-center text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
    >
      {children}
    </Link>
  );
}
