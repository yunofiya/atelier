export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-accent-soft border border-border flex items-center justify-center text-accent font-semibold">
            A
          </div>
          <h1 className="text-lg font-medium tracking-tight">Atelier</h1>
          <p className="text-sm text-muted">Production pipeline for your brand</p>
        </div>
        {children}
      </div>
    </div>
  );
}
