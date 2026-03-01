import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="flex flex-col gap-1">
        <Link
          href="/"
          className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover"
        >
          Dashboard
        </Link>
        <Link
          href="/clients"
          className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover"
        >
          Clients
        </Link>
        <Link
          href="/projects"
          className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover"
        >
          Projects
        </Link>
        <Link
          href="/billing"
          className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover"
        >
          Billing
        </Link>
      </nav>
    </aside>
  );
}
