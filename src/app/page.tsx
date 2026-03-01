import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <main className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">ClientOps</h1>
        <p className="mt-2 text-sm text-slate-600">
          Internal client operations dashboard.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Go to dashboard
        </Link>
      </main>
    </div>
  );
}