"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RedirectToAuth() {
  const user = useUser({ or: "return-null" });
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return; // Still loading
    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/components/sign-in");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-sm text-muted-foreground">Loading…</div>
    </div>
  );
}
