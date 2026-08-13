import { MyTask, TaskStatus } from "@/types/task";

export type StatusFilter = "all" | TaskStatus;
export type DeadlineFilter = "all" | "overdue" | "upcoming" | "later";

export type MyTaskFilters = {
    status: StatusFilter;
    deadline: DeadlineFilter;
};

export const DEFAULT_MY_TASK_FILTERS: MyTaskFilters = {
    status: "all",
    deadline: "all",
};

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Semua status" },
    { value: "unclaimed", label: "Unclaimed" },
    { value: "todo", label: "Todo" },
    { value: "ongoing", label: "Ongoing" },
    { value: "submitted", label: "Submitted" },
    { value: "in_revision", label: "Revisi" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
];

export const DEADLINE_FILTER_OPTIONS: { value: DeadlineFilter; label: string }[] = [
    { value: "all", label: "Semua tenggat" },
    { value: "overdue", label: "Lewat tenggat" },
    { value: "upcoming", label: "Mendekati tenggat" },
    { value: "later", label: "Masih lama" },
];

const UPCOMING_WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // 3 hari

const DONE_STATUSES: TaskStatus[] = ["approved", "rejected"];

export function getDeadlineBucket(task: MyTask): DeadlineFilter | null {
    if (!task.deadline || DONE_STATUSES.includes(task.status)) return null;

    const diff = new Date(task.deadline).getTime() - Date.now();
    if (diff < 0) return "overdue";
    if (diff <= UPCOMING_WINDOW_MS) return "upcoming";
    return "later";
}

export function matchesFilters(task: MyTask, filters: MyTaskFilters): boolean {
    if (filters.status !== "all" && task.status !== filters.status) return false;
    if (filters.deadline !== "all" && getDeadlineBucket(task) !== filters.deadline) return false;
    return true;
}

export function countActiveFilters(filters: MyTaskFilters): number {
    let count = 0;
    if (filters.status !== "all") count++;
    if (filters.deadline !== "all") count++;
    return count;
}
