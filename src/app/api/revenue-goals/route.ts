import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function formatGoal(g: {
  monthKey: string;
  revenueGoal: { toNumber: () => number };
  pipelineGoal: { toNumber: () => number };
}) {
  return {
    monthKey: g.monthKey,
    revenue:
      typeof g.revenueGoal === "object" && "toNumber" in g.revenueGoal
        ? g.revenueGoal.toNumber()
        : Number(g.revenueGoal),
    pipeline:
      typeof g.pipelineGoal === "object" && "toNumber" in g.pipelineGoal
        ? g.pipelineGoal.toNumber()
        : Number(g.pipelineGoal),
  };
}

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await prisma.monthlyGoal.findMany({
      where: { userId: user.id },
      orderBy: { monthKey: "desc" },
    });

    const byMonth = goals.reduce(
      (acc: Record<string, { revenue: number; pipeline: number }>, g) => {
        acc[g.monthKey] = formatGoal(g);
        return acc;
      },
      {} as Record<string, { revenue: number; pipeline: number }>
    );

    return NextResponse.json(byMonth);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load goals";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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

    const rawMonthKey = body.monthKey;
    const revenue = body.revenue;
    const pipeline = body.pipeline;

    if (typeof rawMonthKey !== "string") {
      return NextResponse.json({ error: "monthKey is required" }, { status: 400 });
    }

    const monthKey = rawMonthKey.trim();

    if (!MONTH_KEY_PATTERN.test(monthKey)) {
      return NextResponse.json(
        { error: "monthKey must be in YYYY-MM format" },
        { status: 400 }
      );
    }

    const revenueVal = Math.max(0, Number(revenue) || 0);
    const pipelineVal = Math.max(0, Number(pipeline) || 0);

    const existing = await prisma.monthlyGoal.findFirst({
      where: { userId: user.id, monthKey },
    });

    let goal;
    if (existing) {
      goal = await prisma.monthlyGoal.update({
        where: { id: existing.id },
        data: { revenueGoal: revenueVal, pipelineGoal: pipelineVal },
      });
    } else {
      goal = await prisma.monthlyGoal.create({
        data: {
          userId: user.id,
          monthKey,
          revenueGoal: revenueVal,
          pipelineGoal: pipelineVal,
        },
      });
    }

    return NextResponse.json(formatGoal(goal));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save goals";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}