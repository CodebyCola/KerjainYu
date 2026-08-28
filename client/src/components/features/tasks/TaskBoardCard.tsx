"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Loader2 } from "lucide-react";
import { Task } from "@/types/task";
import { ProjectMember } from "@/types/project";
import { STATUS_STYLE, STATUS_LABEL, getAvailableActions, ActionDefinition } from "@/lib/api/tasks/taskStatus";
import { isTaskAssignee, findTaskAssignee, resolveTaskAssigneeId } from "@/lib/api/tasks/taskAssignee";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/getInitials";
import { taskDetailRoute } from "@/lib/routes";
import { transitionTaskAction } from "@/app/(main)/projects/[projectId]/task-board/actions";

type TaskBoardCardProps = {
    task: Task;
    projectId: string;
    currentUserId: number;
    isLeader: boolean;
    members: ProjectMember[];
    onOptimisticAction?: (taskId: number, nextStatus: Task["status"]) => void;
};

function formatDeadline(deadline: string) {
    return new Date(deadline).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
    });
}

function isOverdue(task: Task) {
    if (!task.deadline) return false;
    if (task.status === "approved" || task.status === "rejected") return false;
    return new Date(task.deadline).getTime() < Date.now();
}

const ACTION_BUTTON_STYLE: Record<ActionDefinition["variant"], string> = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    default: "border border-border bg-card text-foreground hover:border-primary",
    danger: "border border-status-blocked-text bg-card text-status-blocked-text hover:bg-status-blocked-bg",
};

export default function TaskBoardCard({
    task,
    projectId,
    currentUserId,
    isLeader,
    members,
    onOptimisticAction,
}: TaskBoardCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const overdue = isOverdue(task);
    const assignee = findTaskAssignee(task, members);
    const assigneeId = resolveTaskAssigneeId(task);
    const detailHref = taskDetailRoute(projectId, task.id);

    const actions = getAvailableActions(task.status).filter((definition) => {
        if (definition.actor === "leader") return isLeader;
        if (definition.actor === "assignee") return isTaskAssignee(task, currentUserId);
        return true; // "member" — siapapun anggota project boleh klaim
    });

    function handleAction(definition: ActionDefinition) {
        const action = definition.action;
        if (action !== "claim" && action !== "ongoing") {
            router.push(detailHref);
            return;
        }

        setError(null);
        onOptimisticAction?.(task.id, definition.nextStatus);

        startTransition(async () => {
            const result = await transitionTaskAction(projectId, task.id, action);
            if (!result.success) {
                setError(result.error);
            }
        });
    }

    return (
        <div className="rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary">
            <Link href={detailHref} className="flex items-start justify-between gap-2">
                <h4 className="font-inter text-sm font-medium text-foreground hover:underline">{task.title}</h4>
                <span
                    className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-inter font-medium",
                        STATUS_STYLE[task.status]
                    )}
                >
                    {STATUS_LABEL[task.status]}
                </span>
            </Link>

            <div className="mt-2.5 flex items-center justify-between gap-2">
                {task.deadline ? (
                    <span
                        className={cn(
                            "flex items-center gap-1 text-xs font-inter text-muted",
                            overdue && "font-medium text-status-blocked-text"
                        )}
                    >
                        <CalendarDays className="size-3.5" />
                        {formatDeadline(task.deadline)}
                    </span>
                ) : (
                    <span />
                )}

                {assigneeId !== null && (
                    <div
                        title={assignee?.username ?? `User #${assigneeId}`}
                        className="flex size-6 items-center justify-center rounded-full bg-role-member-bg text-[10px] font-inter font-semibold text-role-member-text"
                    >
                        {assignee ? getInitials(assignee.username) : "?"}
                    </div>
                )}
            </div>

            {actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-2.5">
                    {actions.map((definition) => (
                        <button
                            key={definition.action}
                            type="button"
                            disabled={isPending}
                            onClick={() => handleAction(definition)}
                            className={cn(
                                "flex min-h-7 items-center gap-1 rounded-md px-2.5 text-xs font-inter font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                                ACTION_BUTTON_STYLE[definition.variant]
                            )}
                        >
                            {isPending && <Loader2 className="size-3 animate-spin" aria-hidden="true" />}
                            {definition.label}
                        </button>
                    ))}
                </div>
            )}

            {error && (
                <p className="mt-2 text-xs font-inter text-status-blocked-text">{error}</p>
            )}
        </div>
    );
}