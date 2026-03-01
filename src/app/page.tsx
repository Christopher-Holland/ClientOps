import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">ClientOps</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Internal client operations dashboard.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Go to dashboard
        </Link>
      </main>
    </div>
  );
}