"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { TaskComment } from "@/types/task";
import { useSession } from "@/contexts/SessionContext";
import { getInitials } from "@/utils/getInitials";
import { deleteTaskCommentAction } from "@/app/(main)/projects/[projectId]/task-board/actions";

type TaskCommentItemProps = {
    comment: TaskComment;
    projectId: string;
    taskId: number;
};

function formatDateTime(value: string) {
    return new Date(value).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function TaskCommentItem({ comment, projectId, taskId }: TaskCommentItemProps) {
    const user = useSession();
    const [isPending, startTransition] = useTransition();
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const isOwner = user != null && String(user.id) === String(comment.userId);

    function handleDelete() {
        startTransition(async () => {
            await deleteTaskCommentAction(projectId, taskId, comment.id);
            setConfirmingDelete(false);
        });
    }

    return (
        <div className="flex gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-role-member-bg text-[11px] font-inter font-semibold text-role-member-text">
                {getInitials(comment.username)}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-baseline gap-2">
                    <span className="truncate text-sm font-inter font-medium text-foreground">{comment.username}</span>
                    <span className="shrink-0 text-[11px] font-inter text-muted">{formatDateTime(comment.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm font-inter text-foreground">{comment.comment}</p>

                {isOwner && (
                    <div className="mt-1 -ml-2">
                        {confirmingDelete ? (
                            <div className="flex flex-wrap items-center gap-1">
                                <span className="px-2 text-xs font-inter text-muted">Hapus komentar ini?</span>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isPending}
                                    className="flex min-h-8 items-center rounded-md px-2 text-xs font-inter font-medium text-status-blocked-text transition-colors hover:bg-status-blocked-bg disabled:opacity-60"
                                >
                                    {isPending ? <Loader2 className="size-3 animate-spin" aria-hidden="true" /> : "Ya, hapus"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmingDelete(false)}
                                    disabled={isPending}
                                    className="flex min-h-8 items-center rounded-md px-2 text-xs font-inter text-muted transition-colors hover:bg-status-todo-bg disabled:opacity-60"
                                >
                                    Batal
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setConfirmingDelete(true)}
                                aria-label="Hapus komentar"
                                className="flex min-h-8 items-center gap-1 rounded-md px-2 text-xs font-inter text-muted transition-colors hover:bg-status-blocked-bg hover:text-status-blocked-text"
                            >
                                <Trash2 className="size-3" />
                                Hapus
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}