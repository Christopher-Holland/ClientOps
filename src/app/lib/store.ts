export type ClientStatus = "Lead" | "Active" | "On hold";

export type Client = {
    id: string;
    name: string;
    status: ClientStatus;
    lastContact?: string; // ISO date: "2026-03-01"
    nextAction?: string;
    email?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
};

const KEY = "clientops.clients.v1";

function nowIso() {
    return new Date().toISOString();
}

function uid() {
    return Math.random().toString(36).slice(2, 10);
}

export function seedClients(): Client[] {
    const t = nowIso();
    return [
        {
            id: uid(),
            name: "ACME Co.",
            status: "Lead",
            lastContact: "2026-03-01",
            nextAction: "Follow up on proposal",
            email: "hello@acme.com",
            notes: "",
            createdAt: t,
            updatedAt: t,
        },
        {
            id: uid(),
            name: "Oliver — Site Refresh",
            status: "Active",
            lastContact: "2026-02-28",
            nextAction: "Send revised timeline",
            email: "",
            notes: "",
            createdAt: t,
            updatedAt: t,
        },
        {
            id: uid(),
            name: "Local Studio",
            status: "On hold",
            lastContact: "2026-02-10",
            nextAction: "Check in next week",
            email: "",
            notes: "",
            createdAt: t,
            updatedAt: t,
        },
    ];
}

export function loadClients(): Client[] {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as Client[];
    } catch {
        return [];
    }
}

export function saveClients(clients: Client[]) {
    window.localStorage.setItem(KEY, JSON.stringify(clients));
}

export function createClient(partial?: Partial<Client>): Client {
    const t = nowIso();
    return {
        id: uid(),
        name: partial?.name ?? "New client",
        status: partial?.status ?? "Lead",
        lastContact: partial?.lastContact ?? "",
        nextAction: partial?.nextAction ?? "",
        email: partial?.email ?? "",
        notes: partial?.notes ?? "",
        createdAt: t,
        updatedAt: t,
    };
}

export function updateClient(existing: Client, patch: Partial<Client>): Client {
    return {
        ...existing,
        ...patch,
        updatedAt: nowIso(),
    };
}