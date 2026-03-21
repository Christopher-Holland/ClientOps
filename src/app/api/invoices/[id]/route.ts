import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const UI_TO_DB_STATUS: Record<string, "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID"> = {
  Draft: "DRAFT",
  Sent: "SENT",
  Paid: "PAID",
  Overdue: "OVERDUE",
};

const DB_TO_UI_STATUS: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  VOID: "Void",
};

function formatInvoice(inv: {
  id: string;
  invoiceNo: string;
  status: string;
  amount: { toNumber: () => number };
  issuedAt: Date | null;
  dueDate: Date | null;
  paidAt: Date | null;
  projectName: string | null;
  notes: string | null;
  client: { name: string };
}) {
  return {
    id: inv.id,
    client: inv.client.name,
    project: inv.projectName ?? undefined,
    amount: typeof inv.amount === "object" && "toNumber" in inv.amount ? inv.amount.toNumber() : Number(inv.amount),
    status: (DB_TO_UI_STATUS[inv.status] ?? "Draft") as "Draft" | "Sent" | "Paid" | "Overdue",
    issuedOn: inv.issuedAt ? inv.issuedAt.toISOString().slice(0, 10) : undefined,
    dueOn: inv.dueDate ? inv.dueDate.toISOString().slice(0, 10) : undefined,
    paidOn: inv.paidAt ? inv.paidAt.toISOString().slice(0, 10) : undefined,
    notes: inv.notes ?? undefined,
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
  const { client, project, amount, status, issuedOn, dueOn, paidOn, notes } = body;

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    include: { client: true },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (client !== undefined) data.clientId = await findOrCreateClient(user.id, client ?? "");
  if (project !== undefined) data.projectName = (project ?? "").trim() || null;
  if (amount !== undefined) data.amount = Math.max(0, Number(amount) || 0);
  if (status !== undefined) data.status = UI_TO_DB_STATUS[status ?? "Draft"] ?? "DRAFT";
  if (issuedOn !== undefined) {
    data.issuedAt = issuedOn && /^\d{4}-\d{2}-\d{2}$/.test(String(issuedOn).trim()) ? new Date(issuedOn) : null;
  }
  if (dueOn !== undefined) {
    data.dueDate = dueOn && /^\d{4}-\d{2}-\d{2}$/.test(String(dueOn).trim()) ? new Date(dueOn) : null;
  }
  if (paidOn !== undefined) {
    data.paidAt = paidOn && /^\d{4}-\d{2}-\d{2}$/.test(String(paidOn).trim()) ? new Date(paidOn) : null;
  }
  if (notes !== undefined) data.notes = (notes ?? "").trim() || null;

  const updated = await prisma.invoice.update({
    where: { id },
    data,
    include: { client: true },
  });

  return NextResponse.json(formatInvoice(updated));
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

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
