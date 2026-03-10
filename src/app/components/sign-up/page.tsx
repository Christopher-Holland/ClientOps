"use client";

import Link from "next/link";
import { SignUp, useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignUpPage() {
  const user = useUser({ or: "return-null" });
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Redirecting…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-[400px]">
        <div className="rounded-2xl border border-border/70 bg-card px-6 pt-4 pb-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:px-8 sm:pt-5 sm:pb-6">
          <div className="text-center">
            <img src="/clientops.png" alt="ClientOps" className="mx-auto h-64 w-auto object-contain" />
          </div>

          <div className="mt-4">
            <SignUp
              fullPage={false}
              automaticRedirect={true}
              extraInfo={
                <p className="mt-4 text-center text-xs text-card-foreground/80">
                  By signing up, you agree to our terms of service.
                </p>
              }
            />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-foreground">
          Already have an account?{" "}
          <Link
            href="/components/sign-in"
            className="font-medium text-accent hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
