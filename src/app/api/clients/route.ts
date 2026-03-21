import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatClient(c: {
  id: string;
  name: string;
  status: string | null;
  lastContact: Date | null;
  nextAction: string | null;
  email: string | null;
  notesText: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: c.id,
    name: c.name,
    status: c.status ?? "Lead",
    lastContact: c.lastContact
      ? c.lastContact.toISOString().slice(0, 10)
      : undefined,
    nextAction: c.nextAction ?? undefined,
    email: c.email ?? undefined,
    notes: c.notesText ?? undefined,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(clients.map(formatClient));
}

export async function POST(request: Request) {
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
  const { name, status, lastContact, nextAction, email, notes } = body;

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      name: name?.trim() || "New client",
      status: status ?? "Lead",
      lastContact: lastContact ? new Date(lastContact) : null,
      nextAction: nextAction?.trim() || null,
      email: email?.trim() || null,
      notesText: notes?.trim() || null,
    },
  });

  return NextResponse.json(formatClient(client));
}
