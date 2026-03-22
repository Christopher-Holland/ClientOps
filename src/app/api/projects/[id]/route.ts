import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  budget: { toNumber?: () => number } | number | null;
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { name, client, status, pricingType, amount, hoursInvested, due, next } = body;

    const project = await prisma.project.findFirst({
      where: { id, userId: user.id },
      include: { client: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = String(name ?? "").trim() || "Untitled";
    if (client !== undefined) data.clientId = await findOrCreateClient(user.id, String(client ?? ""));
    if (status !== undefined) data.status = UI_TO_DB_STATUS[String(status ?? "Discovery")] ?? "LEAD";
    if (pricingType !== undefined) data.pricingType = String(pricingType ?? "fixed");
    if (amount !== undefined) data.budget = Math.max(0, Number(amount) || 0);
    if (hoursInvested !== undefined) data.hoursInvested = Number(hoursInvested);
    if (due !== undefined) {
      data.dueDate = due && /^\d{4}-\d{2}-\d{2}$/.test(String(due).trim()) ? new Date(String(due)) : null;
    }
    if (next !== undefined) data.nextAction = String(next ?? "").trim() || null;

    const updated = await prisma.project.update({
      where: { id },
      data,
      include: { client: true },
    });

    return NextResponse.json(formatProject(updated));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: { id, userId: user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
