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