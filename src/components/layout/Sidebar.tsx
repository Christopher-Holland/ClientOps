import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="flex flex-col gap-1">
        <Link
          href="/"
          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Dashboard
        </Link>
        <Link
          href="/clients"
          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Clients
        </Link>
        <Link
          href="/projects"
          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Projects
        </Link>
        <Link
          href="/billing"
          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Billing
        </Link>
      </nav>
    </aside>
  );
}
