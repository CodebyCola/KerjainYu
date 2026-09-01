import { CalendarDays, ListOrdered, User } from "lucide-react";
import { Task } from "@/types/task";
import { ProjectMember } from "@/types/project";
import { resolveTaskAssigneeId } from "@/lib/api/tasks/taskAssignee";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/getInitials";

type TaskDetailInfoProps = {
    task: Task;
    assignee?: ProjectMember;
};

function formatDeadline(deadline: string) {
    return new Date(deadline).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function isOverdue(task: Task) {
    if (!task.deadline) return false;
    if (task.status === "approved" || task.status === "rejected") return false;
    return new Date(task.deadline).getTime() < Date.now();
}

export default function TaskDetailInfo({ task, assignee }: TaskDetailInfoProps) {
    const overdue = isOverdue(task);
    const assigneeId = resolveTaskAssigneeId(task);
    const hasAssignee = assigneeId !== null;
    const assigneeName = assignee?.fullName ?? assignee?.username ?? task.assignee?.username;

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-1.5">
                <h3 className="font-inter text-sm font-semibold text-foreground">Deskripsi</h3>
                {task.description ? (
                    <p className="whitespace-pre-wrap text-sm font-inter text-muted">{task.description}</p>
                ) : (
                    <p className="text-sm font-inter italic text-muted">Belum ada deskripsi.</p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-status-todo-bg">
                        <CalendarDays className={cn("size-4", overdue ? "text-status-blocked-text" : "text-muted")} />
                    </div>
                    <div className="flex min-w-0 flex-col">
                        <span className="text-[11px] font-inter text-muted">Deadline</span>
                        {task.deadline ? (
                            <span
                                className={cn(
                                    "truncate text-sm font-inter font-medium text-foreground",
                                    overdue && "text-status-blocked-text"
                                )}
                            >
                                {formatDeadline(task.deadline)}
                                {overdue && " · Lewat"}
                            </span>
                        ) : (
                            <span className="text-sm font-inter text-muted">Tidak ada</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-status-todo-bg">
                        <ListOrdered className="size-4 text-muted" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                        <span className="text-[11px] font-inter text-muted">Prioritas</span>
                        <span className="text-sm font-inter font-medium text-foreground">
                            {task.priority ?? "Tidak diatur"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {hasAssignee ? (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-role-member-bg text-[11px] font-inter font-semibold text-role-member-text">
                            {getInitials(assigneeName ?? `#${assigneeId}`)}
                        </div>
                    ) : (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-status-todo-bg">
                            <User className="size-4 text-muted" />
                        </div>
                    )}
                    <div className="flex min-w-0 flex-col">
                        <span className="text-[11px] font-inter text-muted">Penanggung jawab</span>
                        <span className="truncate text-sm font-inter font-medium text-foreground">
                            {hasAssignee ? (assigneeName ?? `User #${assigneeId}`) : "Belum diklaim"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}