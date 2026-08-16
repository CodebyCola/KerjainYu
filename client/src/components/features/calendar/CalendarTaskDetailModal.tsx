"use client";

import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Task } from "@/types/task";
import { STATUS_STYLE, STATUS_LABEL } from "@/lib/api/tasks/taskStatus";
import { isTaskOverdue, formatDayLabel } from "@/utils/calendar";
import { taskDetailRoute } from "@/lib/routes";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/getInitials";

type CalendarTaskDetailModalProps = {
    task: Task | null;
    projectId: string;
    onClose: () => void;
};

export default function CalendarTaskDetailModal({ task, projectId, onClose }: CalendarTaskDetailModalProps) {
    const assignee = task?.assignee ?? undefined;
    const overdue = task ? isTaskOverdue(task) : false;

    return (
        <Modal isOpen={task !== null} onClose={onClose} title="Detail Tugas">
            {task && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-inter text-base font-semibold text-foreground">{task.title}</h3>
                        <span
                            className={cn(
                                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-inter font-medium",
                                STATUS_STYLE[task.status]
                            )}
                        >
                            {STATUS_LABEL[task.status]}
                        </span>
                    </div>

                    {task.description && (
                        <p className="text-sm font-inter text-muted">{task.description}</p>
                    )}

                    <div className="flex flex-col gap-2 border-t border-border pt-3">
                        {task.deadline ? (
                            <span
                                className={cn(
                                    "flex items-center gap-2 text-sm font-inter text-muted",
                                    overdue && "font-medium text-status-blocked-text"
                                )}
                            >
                                <CalendarDays className="size-4" />
                                {formatDayLabel(new Date(task.deadline))}
                                {overdue && " · Lewat tenggat"}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 text-sm font-inter text-muted">
                                <CalendarDays className="size-4" />
                                Belum ada tenggat
                            </span>
                        )}

                        <span className="flex items-center gap-2 text-sm font-inter text-muted">
                            <span className="flex size-6 items-center justify-center rounded-full bg-role-member-bg text-[10px] font-inter font-semibold text-role-member-text">
                                {assignee ? getInitials(assignee.username) : "?"}
                            </span>
                            {assignee ? assignee.username : "Belum ada penanggung jawab"}
                        </span>
                    </div>

                    <Link
                        href={taskDetailRoute(projectId, task.id)}
                        className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                        Buka detail tugas
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            )}
        </Modal>
    );
}