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
    const { name, status, lastContact, nextAction, email, notes } = body;

    const client = await prisma.client.findFirst({
      where: { id, userId: user.id },
    });

    if (!client) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...(name !== undefined && {
          name: String(name ?? "").trim() || "Untitled",
        }),
        ...(status !== undefined && { status: String(status) }),
        ...(lastContact !== undefined && {
          lastContact: lastContact != null ? new Date(String(lastContact)) : null,
        }),
        ...(nextAction !== undefined && {
          nextAction: String(nextAction ?? "").trim() || null,
        }),
        ...(email !== undefined && { email: String(email ?? "").trim() || null }),
        ...(notes !== undefined && { notesText: String(notes ?? "").trim() || null }),
      },
    });

    return NextResponse.json(formatClient(updated));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update client";
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

    const client = await prisma.client.findFirst({
      where: { id, userId: user.id },
    });

    if (!client) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete client";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
