import Link from "next/link";
import { CalendarDays, FolderOpen } from "lucide-react";
import { MyTask, TaskStatus } from "@/types/task";
import { cn } from "@/utils/cn";

type TaskListCardProps = {
    task: MyTask;
};

// App cuma punya 4 token warna status (todo/progress/done/blocked), jadi 7
// status task dipetakan ke token yang paling sesuai maknanya.
const STATUS_STYLE: Record<TaskStatus, string> = {
    unclaimed: "bg-status-todo-bg text-status-todo-text",
    todo: "bg-status-todo-bg text-status-todo-text",
    ongoing: "bg-status-progress-bg text-status-progress-text",
    submitted: "bg-status-progress-bg text-status-progress-text",
    in_revision: "bg-status-blocked-bg text-status-blocked-text",
    rejected: "bg-status-blocked-bg text-status-blocked-text",
    approved: "bg-status-done-bg text-status-done-text",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
    unclaimed: "Unclaimed",
    todo: "Todo",
    ongoing: "Ongoing",
    submitted: "Submitted",
    in_revision: "Revisi",
    rejected: "Rejected",
    approved: "Approved",
};

function formatDeadline(deadline: string) {
    return new Date(deadline).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function isOverdue(task: MyTask) {
    if (!task.deadline) return false;
    if (task.status === "approved" || task.status === "rejected") return false;
    return new Date(task.deadline).getTime() < Date.now();
}

export default function TaskListCard({ task }: TaskListCardProps) {
    const overdue = isOverdue(task);

    return (
        <Link
            href={`/projects/${task.projectId}/task-board/${task.id}`}
            aria-label={`Buka tugas ${task.title}`}
            className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary sm:p-5"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <h3 className="font-inter text-base font-semibold text-foreground sm:text-lg">
                    {task.title}
                </h3>
                <span
                    className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-inter font-medium",
                        STATUS_STYLE[task.status]
                    )}
                >
                    {STATUS_LABEL[task.status]}
                </span>
            </div>

            {/* Meta */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-inter text-muted sm:text-sm">
                <span className="flex items-center gap-1.5">
                    <FolderOpen className="size-3.5 sm:size-4" />
                    {task.projectTitle}
                </span>

                {task.deadline && (
                    <span
                        className={cn(
                            "flex items-center gap-1.5",
                            overdue && "text-status-blocked-text font-medium"
                        )}
                    >
                        <CalendarDays className="size-3.5 sm:size-4" />
                        {formatDeadline(task.deadline)}
                        {overdue && " · Lewat tenggat"}
                    </span>
                )}
            </div>
        </Link>
    );
}
