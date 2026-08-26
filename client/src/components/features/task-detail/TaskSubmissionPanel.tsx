"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    Clock,
    MessageSquareWarning,
    XCircle,
    FileText,
    Link2,
    Paperclip,
    Image as ImageIcon,
    Trash2,
    Loader2,
} from "lucide-react";
import { SubmissionAttachment, TaskSubmission } from "@/types/task";
import { cn } from "@/utils/cn";
import { deleteSubmissionAttachmentAction } from "@/app/(main)/projects/[projectId]/task-board/actions";

type TaskSubmissionPanelProps = {
    submission: TaskSubmission;
    attachments: SubmissionAttachment[];
    projectId: string;
    taskId: number;
    canManageAttachments: boolean;
};

const REVIEW_STATUS_META: Record<
    TaskSubmission["reviewStatus"],
    { label: string; icon: typeof Clock; className: string }
> = {
    pending: { label: "Menunggu review", icon: Clock, className: "bg-status-progress-bg text-status-progress-text" },
    approved: { label: "Disetujui", icon: CheckCircle2, className: "bg-status-done-bg text-status-done-text" },
    revision_requested: {
        label: "Revisi diminta",
        icon: MessageSquareWarning,
        className: "bg-status-blocked-bg text-status-blocked-text",
    },
    rejected: { label: "Ditolak", icon: XCircle, className: "bg-status-blocked-bg text-status-blocked-text" },
};

function formatDateTime(value: string) {
    return new Date(value).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentIcon({ type }: { type: SubmissionAttachment["type"] }) {
    if (type === "link") return <Link2 className="size-3.5 shrink-0" />;
    if (type === "text") return <FileText className="size-3.5 shrink-0" />;
    if (type === "image") return <ImageIcon className="size-3.5 shrink-0" />;
    return <Paperclip className="size-3.5 shrink-0" />;
}

export default function TaskSubmissionPanel({
    submission,
    attachments,
    projectId,
    taskId,
    canManageAttachments,
}: TaskSubmissionPanelProps) {
    const router = useRouter();
    const meta = REVIEW_STATUS_META[submission.reviewStatus];
    const Icon = meta.icon;
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();

    const canDelete =
        canManageAttachments && ["pending", "revision_requested"].includes(submission.reviewStatus);

    function handleDelete(attachmentId: number) {
        setError(null);
        setDeletingId(attachmentId);
        startTransition(async () => {
            const result = await deleteSubmissionAttachmentAction(
                projectId,
                taskId,
                submission.id,
                attachmentId,
            );
            setDeletingId(null);
            if (!result.success) {
                setError(result.error);
                return;
            }
            router.refresh();
        });
    }

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
                <h3 className="font-inter text-sm font-semibold text-foreground">Submission terakhir</h3>
                <span
                    className={cn(
                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-inter font-medium",
                        meta.className
                    )}
                >
                    <Icon className="size-3.5" />
                    {meta.label}
                </span>
            </div>

            <div className="flex flex-col gap-1.5">
                <p className="text-[11px] font-inter text-muted">
                    Disubmit {formatDateTime(submission.submittedAt)}
                </p>
                {submission.note ? (
                    <p className="whitespace-pre-wrap rounded-lg bg-status-todo-bg p-3 text-sm font-inter text-foreground">
                        {submission.note}
                    </p>
                ) : (
                    <p className="text-sm font-inter italic text-muted">Tidak ada catatan dari assignee.</p>
                )}
            </div>

            {attachments.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-inter text-muted">Lampiran ({attachments.length})</span>
                    <ul className="flex flex-col gap-1.5">
                        {attachments.map((attachment) => (
                            <li
                                key={attachment.id}
                                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-inter text-foreground"
                            >
                                <AttachmentIcon type={attachment.type} />
                                {attachment.type === "link" ? (
                                    <a
                                        href={attachment.content ?? "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="min-w-0 flex-1 truncate text-primary hover:underline"
                                    >
                                        {attachment.content}
                                    </a>
                                ) : attachment.type === "text" ? (
                                    <span className="min-w-0 flex-1 whitespace-pre-wrap">{attachment.content}</span>
                                ) : (
                                    <span className="min-w-0 flex-1 truncate">
                                        {attachment.fileName}
                                        {attachment.fileSize !== null && (
                                            <span className="text-muted"> · {formatFileSize(attachment.fileSize)}</span>
                                        )}
                                    </span>
                                )}
                                {canDelete && (
                                    <button
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => handleDelete(attachment.id)}
                                        aria-label="Hapus lampiran"
                                        className="shrink-0 text-muted transition-colors hover:text-status-blocked-text disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isPending && deletingId === attachment.id ? (
                                            <Loader2 className="size-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="size-3.5" />
                                        )}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {error && <p className="text-xs font-inter text-status-blocked-text">{error}</p>}

            {submission.reviewStatus !== "pending" && (
                <div className="flex flex-col gap-1.5 border-t border-border pt-3.5">
                    <p className="text-[11px] font-inter text-muted">
                        Direview {submission.reviewedAt ? formatDateTime(submission.reviewedAt) : ""}
                    </p>
                    {submission.reviewNote ? (
                        <p className="whitespace-pre-wrap rounded-lg bg-status-todo-bg p-3 text-sm font-inter text-foreground">
                            {submission.reviewNote}
                        </p>
                    ) : (
                        <p className="text-sm font-inter italic text-muted">Tidak ada catatan dari leader.</p>
                    )}
                </div>
            )}
        </div>
    );
}
