import "server-only";
import { stackServerApp } from "@/stack/server";
import { prisma } from "@/lib/prisma";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
};

/**
 * Get the current app user from the request. Syncs Stack Auth user to our User table.
 * Returns null if not authenticated.
 */
export async function getAuthUser(
  request: Request
): Promise<AuthUser | null> {
  const stackUser = await stackServerApp.getUser({
    tokenStore: request,
    or: "return-null",
  });

  if (!stackUser) return null;

  const email = stackUser.primaryEmail ?? `user-${stackUser.id}@stack.local`;
  const name = stackUser.displayName ?? null;

  let user = await prisma.user.findUnique({
    where: { stackUserId: stackUser.id },
  });

  if (!user) {
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: { stackUserId: stackUser.id, name },
      });
    } else {
      user = await prisma.user.create({
        data: {
          stackUserId: stackUser.id,
          email,
          name,
        },
      });
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
