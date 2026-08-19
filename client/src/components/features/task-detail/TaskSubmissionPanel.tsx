import { CheckCircle2, Clock, MessageSquareWarning, XCircle } from "lucide-react";
import { TaskSubmission } from "@/types/task";
import { cn } from "@/utils/cn";

type TaskSubmissionPanelProps = {
    submission: TaskSubmission;
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

// Menampilkan submission assignee terakhir & hasil review leader (kalau
// sudah direview) — satu row task_submissions mewakili satu siklus submit.
export default function TaskSubmissionPanel({ submission }: TaskSubmissionPanelProps) {
    const meta = REVIEW_STATUS_META[submission.reviewStatus];
    const Icon = meta.icon;

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
