import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULTS = {
  timezone: "America/New_York",
  currency: "USD",
  defaultProjectStatus: "Discovery",
  weekStartsOn: "Monday",
} as const;

const VALID_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "UTC",
];

const VALID_CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"];

const VALID_PROJECT_STATUSES = ["Discovery", "Build", "Review", "Live"];

const VALID_WEEK_STARTS = ["Sunday", "Monday"];

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role ?? "owner",
      },
      settings: settings
        ? {
            timezone: settings.timezone,
            currency: settings.currency,
            defaultProjectStatus: settings.defaultProjectStatus,
            weekStartsOn: settings.weekStartsOn,
          }
        : DEFAULTS,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      timezone,
      currency,
      defaultProjectStatus,
      weekStartsOn,
    } = body;

    const data: {
      timezone?: string;
      currency?: string;
      defaultProjectStatus?: string;
      weekStartsOn?: string;
    } = {};

    if (timezone != null) {
      const tz = String(timezone).trim();
      data.timezone = VALID_TIMEZONES.includes(tz) ? tz : DEFAULTS.timezone;
    }
    if (currency != null) {
      const cur = String(currency).trim().toUpperCase();
      data.currency = VALID_CURRENCIES.includes(cur) ? cur : DEFAULTS.currency;
    }
    if (defaultProjectStatus != null) {
      const status = String(defaultProjectStatus).trim();
      data.defaultProjectStatus = VALID_PROJECT_STATUSES.includes(status)
        ? status
        : DEFAULTS.defaultProjectStatus;
    }
    if (weekStartsOn != null) {
      const day = String(weekStartsOn).trim();
      data.weekStartsOn = VALID_WEEK_STARTS.includes(day)
        ? day
        : DEFAULTS.weekStartsOn;
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        timezone: data.timezone ?? DEFAULTS.timezone,
        currency: data.currency ?? DEFAULTS.currency,
        defaultProjectStatus:
          data.defaultProjectStatus ?? DEFAULTS.defaultProjectStatus,
        weekStartsOn: data.weekStartsOn ?? DEFAULTS.weekStartsOn,
      },
      update: data,
    });

    return NextResponse.json({
      timezone: settings.timezone,
      currency: settings.currency,
      defaultProjectStatus: settings.defaultProjectStatus,
      weekStartsOn: settings.weekStartsOn,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
