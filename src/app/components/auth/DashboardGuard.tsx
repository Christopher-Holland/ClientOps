"use client";

import { useUser } from "@stackframe/stack";

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  useUser({ or: "redirect" });
  return <>{children}</>;
}
