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

async function generateInvoiceNo(userId: string): Promise<string> {
  const count = await prisma.invoice.count({ where: { userId } });
  return `INV-${String(count + 1).padStart(4, "0")}`;
}

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    include: { client: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(invoices.map(formatInvoice));
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { client, project, amount, status, issuedOn, dueOn, paidOn, notes } = body;

    const clientId = await findOrCreateClient(user.id, client ?? "");
    const invoiceNo = await generateInvoiceNo(user.id);

    const dbStatus = UI_TO_DB_STATUS[status ?? "Draft"] ?? "DRAFT";

    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        clientId,
        projectName: (project ?? "").trim() || null,
        invoiceNo,
        status: dbStatus,
        amount: Number(amount) || 0,
        issuedAt: issuedOn && /^\d{4}-\d{2}-\d{2}$/.test(String(issuedOn).trim()) ? new Date(issuedOn) : null,
        dueDate: dueOn && /^\d{4}-\d{2}-\d{2}$/.test(String(dueOn).trim()) ? new Date(dueOn) : null,
        paidAt: paidOn && /^\d{4}-\d{2}-\d{2}$/.test(String(paidOn).trim()) ? new Date(paidOn) : null,
        notes: (notes ?? "").trim() || null,
      },
      include: { client: true },
    });

    return NextResponse.json(formatInvoice(invoice));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create invoice";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
