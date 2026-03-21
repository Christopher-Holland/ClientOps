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

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notes = await prisma.revenueNote.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(notes.map(formatNote));
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { name, client, status, pricingType, amount, hoursInvested, date, notes } = body;

    const note = await prisma.revenueNote.create({
      data: {
        userId: user.id,
        name: (name ?? "").trim() || "Untitled",
        clientName: (client ?? "").trim() || "—",
        status: status ?? "Discovery",
        pricingType: pricingType ?? "fixed",
        amount: Number(amount) || 0,
        hoursInvested: hoursInvested != null ? Number(hoursInvested) : null,
        date: date && /^\d{4}-\d{2}-\d{2}$/.test(String(date).trim()) ? new Date(date) : new Date(),
        notes: (notes ?? "").trim() || null,
      },
    });

    return NextResponse.json(formatNote(note));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create revenue note";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
