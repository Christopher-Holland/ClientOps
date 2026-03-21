import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatNote(n: {
  id: string;
  name: string;
  clientName: string;
  status: string;
  pricingType: string;
  amount: { toNumber: () => number };
  hoursInvested: number | null;
  date: Date;
  notes: string | null;
}) {
  return {
    id: n.id,
    name: n.name,
    client: n.clientName,
    status: n.status as "Discovery" | "Build" | "Review" | "Live",
    pricingType: n.pricingType as "fixed" | "hourly" | "retainer",
    amount: typeof n.amount === "object" && "toNumber" in n.amount ? n.amount.toNumber() : Number(n.amount),
    hoursInvested: n.hoursInvested ?? undefined,
    date: n.date.toISOString().slice(0, 10),
    notes: n.notes ?? undefined,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
  const { name, client, status, pricingType, amount, hoursInvested, date, notes } = body;

  const note = await prisma.revenueNote.findFirst({
    where: { id, userId: user.id },
  });

  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = (name ?? "").trim() || "Untitled";
  if (client !== undefined) data.clientName = (client ?? "").trim() || "—";
  if (status !== undefined) data.status = status ?? "Discovery";
  if (pricingType !== undefined) data.pricingType = pricingType ?? "fixed";
  if (amount !== undefined) data.amount = amount;
  if (hoursInvested !== undefined) data.hoursInvested = hoursInvested;
  if (date !== undefined) {
    data.date = date && /^\d{4}-\d{2}-\d{2}$/.test(String(date).trim()) ? new Date(date) : note.date;
  }
  if (notes !== undefined) data.notes = (notes ?? "").trim() || null;

  const updated = await prisma.revenueNote.update({
    where: { id },
    data,
  });

  return NextResponse.json(formatNote(updated));
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const note = await prisma.revenueNote.findFirst({
    where: { id, userId: user.id },
  });

  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.revenueNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
