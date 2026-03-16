import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const UI_TO_DB_STATUS: Record<string, "LEAD" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED"> = {
  Discovery: "LEAD",
  Build: "ACTIVE",
  Review: "ON_HOLD",
  Live: "COMPLETED",
  Paused: "ON_HOLD",
};

const DB_TO_UI_STATUS: Record<string, string> = {
  LEAD: "Discovery",
  ACTIVE: "Build",
  ON_HOLD: "Review",
  COMPLETED: "Live",
  ARCHIVED: "Paused",
};

function formatProject(p: {
  id: string;
  name: string;
  status: string;
  budget: Prisma.Decimal | null;
  dueDate: Date | null;
  pricingType: string | null;
  hoursInvested: number | null;
  nextAction: string | null;
  client: { name: string };
}) {
  const due = p.dueDate ? p.dueDate.toISOString().slice(0, 10) : "—";
  return {
    id: p.id,
    name: p.name,
    client: p.client.name,
    pricingType: (p.pricingType ?? "fixed") as "fixed" | "hourly" | "retainer",
    amount: p.budget ? Number(p.budget) : 0,
    hoursInvested: p.hoursInvested ?? undefined,
    status: (DB_TO_UI_STATUS[p.status] ?? "Discovery") as "Discovery" | "Build" | "Review" | "Live",
    due,
    next: p.nextAction ?? "",
  };
}

async function findOrCreateClient(userId: string, clientName: string) {
  const name = clientName.trim() || "—";
  let client = await prisma.client.findFirst({
    where: { userId, name },
  });
  if (!client) {
    client = await prisma.client.create({
      data: { userId, name, status: "Lead" },
    });
  }
  return client.id;
}

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: { client: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects.map(formatProject));
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, client, status, pricingType, amount, hoursInvested, due, next } = body;

    const clientId = await findOrCreateClient(user.id, client ?? "");

    const dueDate = due && /^\d{4}-\d{2}-\d{2}$/.test(String(due).trim())
      ? new Date(due)
      : null;

    const dbStatus = UI_TO_DB_STATUS[status ?? "Discovery"] ?? "LEAD";

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        clientId,
        name: (name ?? "").trim() || "Untitled",
        status: dbStatus,
        budget: amount != null ? Number(amount) : null,
        dueDate,
        pricingType: pricingType ?? "fixed",
        hoursInvested: hoursInvested != null && hoursInvested !== "" ? Number(hoursInvested) : null,
        nextAction: (next ?? "").trim() || null,
      },
      include: { client: true },
    });

    return NextResponse.json(formatProject(project));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
