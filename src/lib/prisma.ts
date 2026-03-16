import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// In dev, avoid reusing a stale client that may lack new models (e.g. after schema changes)
const cached = globalForPrisma.prisma as PrismaClient | undefined;
const cachedIsValid =
  cached &&
  typeof (cached as { userSettings?: { findUnique?: unknown } }).userSettings?.findUnique ===
    "function";

export const prisma: PrismaClient =
  process.env.NODE_ENV === "production" || cachedIsValid
    ? (cached ?? new PrismaClient({ adapter }))
    : new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
