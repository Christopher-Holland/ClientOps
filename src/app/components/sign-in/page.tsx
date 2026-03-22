"use client";

import Link from "next/link";
import { SignIn, useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
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
            <img src="/clientops.png" alt="ClientOps" className="mx-auto h-32 w-auto object-contain" />
          </div>
          <div className="text-center">
            <p className="text-sm text-accent">
              Demo account: <span className="font-medium">demo@clientops.com</span>
            </p>
            <p className="text-sm text-accent">
              Demo password: <span className="font-medium">clientops123</span>
            </p>
          </div>

          <div className="mt-4">
            <SignIn
              fullPage={false}
              automaticRedirect={true}
              extraInfo={
                <p className="mt-4 text-center text-xs text-card-foreground/80">
                  By signing in, you agree to our terms of service.
                </p>
              }
            />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/components/sign-up"
            className="font-medium text-accent hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
