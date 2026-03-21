import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        projectId: t.projectId ?? undefined,
        dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : undefined,
        completedAt: t.completedAt ? t.completedAt.toISOString() : undefined,
      }))
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load tasks";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
