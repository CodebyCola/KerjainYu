"use client";

import Link from "next/link";
import { ArrowLeftRight, Loader2, X, FolderOpen } from "lucide-react";
import { TaskSwapRequestListItem, TaskSwapRequestStatus } from "@/types/task";
import { taskDetailRoute } from "@/lib/routes";
import { cn } from "@/utils/cn";

type OutgoingSwapRequestItemProps = {
    request: TaskSwapRequestListItem;
    isCancelling: boolean;
    error: string | null;
    onCancel: (request: TaskSwapRequestListItem) => void;
};

const STATUS_STYLE: Record<TaskSwapRequestStatus, string> = {
    pending: "bg-status-progress-bg text-status-progress-text",
    approved: "bg-status-done-bg text-status-done-text",
    rejected: "bg-status-blocked-bg text-status-blocked-text",
    cancelled: "bg-status-todo-bg text-status-todo-text",
};

const STATUS_LABEL: Record<TaskSwapRequestStatus, string> = {
    pending: "Menunggu",
    approved: "Diterima",
    rejected: "Ditolak",
    cancelled: "Dibatalkan",
};

export default function OutgoingSwapRequestItem({
    request,
    isCancelling,
    error,
    onCancel,
}: OutgoingSwapRequestItemProps) {
    const isPending = request.status === "pending";

    return (
        <div className="flex flex-col gap-2.5 rounded-lg border border-border p-3 sm:p-3.5">
            <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-status-progress-bg text-status-progress-text">
                    <ArrowLeftRight className="size-4" aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="truncate font-inter text-sm font-medium text-foreground">
                            {request.task.title}
                        </p>
                        <span
                            className={cn(
                                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-inter font-medium",
                                STATUS_STYLE[request.status]
                            )}
                        >
                            {STATUS_LABEL[request.status]}
                        </span>
                    </div>

                    <p className="mt-0.5 truncate font-inter text-xs text-muted">
                        {request.targetTask
                            ? `Ditukar dengan "${request.targetTask.title}" milik ${request.requestedTo.username}`
                            : `Ditawarkan ke ${request.requestedTo.username}`}
                    </p>

                    <Link
                        href={taskDetailRoute(String(request.task.projectId), request.task.id)}
                        className="mt-1.5 inline-flex items-center gap-1 font-inter text-xs font-medium text-primary hover:underline"
                    >
                        <FolderOpen className="size-3.5" />
                        Lihat task
                    </Link>
                </div>
            </div>

            {isPending && (
                <div className="flex justify-end">
                    {isCancelling ? (
                        <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-inter text-muted">
                            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                            Membatalkan...
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onCancel(request)}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 font-inter text-xs font-medium text-status-blocked-text transition-colors hover:bg-status-blocked-bg"
                        >
                            <X className="size-3.5" />
                            Batalkan
                        </button>
                    )}
                </div>
            )}

            {error && <p className="font-inter text-xs text-status-blocked-text">{error}</p>}
        </div>
    );
}
