import { StackClientApp } from "@stackframe/stack";

const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_STACK_PROJECT_ID in .env.local");
}

export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  projectId,
  publishableClientKey,
  noAutomaticPrefetch: true,
});