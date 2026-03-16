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
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
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
      ...(name !== undefined && { name: name?.trim() || "Untitled" }),
      ...(status !== undefined && { status }),
      ...(lastContact !== undefined && {
        lastContact: lastContact ? new Date(lastContact) : null,
      }),
      ...(nextAction !== undefined && {
        nextAction: nextAction?.trim() || null,
      }),
      ...(email !== undefined && { email: email?.trim() || null }),
      ...(notes !== undefined && { notesText: notes?.trim() || null }),
    },
  });

  return NextResponse.json(formatClient(updated));
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

  const client = await prisma.client.findFirst({
    where: { id, userId: user.id },
  });

  if (!client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
