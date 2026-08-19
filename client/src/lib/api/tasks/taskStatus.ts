import { TaskStatus } from "@/types/task";

// Alur status task (state machine). Lihat server/TASK_BOARD_BACKEND.md §1
// untuk kontrak lengkap dengan backend — daftar ini harus tetap sinkron.
export type TaskAction = "claim" | "ongoing" | "submit" | "resume" | "approve" | "requestRevision" | "reject";

export const STATUS_LABEL: Record<TaskStatus, string> = {
    unclaimed: "Unclaimed",
    todo: "Todo",
    ongoing: "Ongoing",
    submitted: "Submitted",
    in_revision: "Revisi",
    rejected: "Rejected",
    approved: "Approved",
};

// App cuma punya 4 token warna status (todo/progress/done/blocked), jadi 7
// status task dipetakan ke token yang paling sesuai maknanya.
export const STATUS_STYLE: Record<TaskStatus, string> = {
    unclaimed: "bg-status-todo-bg text-status-todo-text",
    todo: "bg-status-todo-bg text-status-todo-text",
    ongoing: "bg-status-progress-bg text-status-progress-text",
    submitted: "bg-status-progress-bg text-status-progress-text",
    in_revision: "bg-status-blocked-bg text-status-blocked-text",
    rejected: "bg-status-blocked-bg text-status-blocked-text",
    approved: "bg-status-done-bg text-status-done-text",
};

export type ActorRole = "member" | "assignee" | "leader";

export type ActionDefinition = {
    action: TaskAction;
    label: string;
    actor: ActorRole;
    nextStatus: TaskStatus;
    variant: "primary" | "default" | "danger";
};

export const AVAILABLE_ACTIONS: Record<TaskStatus, ActionDefinition[]> = {
    unclaimed: [
        { action: "claim", label: "Klaim tugas", actor: "member", nextStatus: "todo", variant: "primary" },
    ],
    todo: [
        { action: "ongoing", label: "Mulai kerjakan", actor: "assignee", nextStatus: "ongoing", variant: "primary" },
    ],
    ongoing: [
        { action: "submit", label: "Submit hasil", actor: "assignee", nextStatus: "submitted", variant: "primary" },
    ],
    submitted: [
        { action: "approve", label: "Setujui", actor: "leader", nextStatus: "approved", variant: "primary" },
        { action: "requestRevision", label: "Minta revisi", actor: "leader", nextStatus: "in_revision", variant: "default" },
        { action: "reject", label: "Tolak", actor: "leader", nextStatus: "rejected", variant: "danger" },
    ],
    in_revision: [
        { action: "resume", label: "Kerjakan lagi", actor: "assignee", nextStatus: "ongoing", variant: "primary" },
    ],
    approved: [],
    rejected: [],
};

export function getAvailableActions(status: TaskStatus): ActionDefinition[] {
    return AVAILABLE_ACTIONS[status] ?? [];
}

export type BoardColumnId = "unclaimed" | "todo" | "ongoing" | "submitted" | "done";

export type BoardColumn = {
    id: BoardColumnId;
    label: string;
    statuses: TaskStatus[];
};

export const BOARD_COLUMNS: BoardColumn[] = [
    { id: "unclaimed", label: "Belum diklaim", statuses: ["unclaimed"] },
    { id: "todo", label: "To Do", statuses: ["todo"] },
    { id: "ongoing", label: "Dikerjakan", statuses: ["ongoing"] },
    { id: "submitted", label: "Ditinjau", statuses: ["submitted", "in_revision"] },
    { id: "done", label: "Selesai", statuses: ["approved", "rejected"] },
];

export function getColumnForStatus(status: TaskStatus): BoardColumnId {
    const column = BOARD_COLUMNS.find((col) => col.statuses.includes(status));
    return column?.id ?? "todo";
}
