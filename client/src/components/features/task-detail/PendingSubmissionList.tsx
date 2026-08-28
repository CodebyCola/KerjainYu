"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { PendingSubmission } from "@/types/task";
import { taskDetailRoute } from "@/lib/routes";
import { cn } from "@/utils/cn";

type PendingSubmissionListProps = {
    submissions: PendingSubmission[];
    projectId: string;
};

function formatDateTime(value: string) {
    return new Date(value).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const STATUS_META = {
    label: "Menunggu review",
    icon: Clock,
    className: "bg-status-progress-bg text-status-progress-text",
};

export default function PendingSubmissionList({ submissions, projectId }: PendingSubmissionListProps) {
    if (submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <p className="text-sm font-inter font-medium text-foreground">Tidak ada submission menunggu review</p>
                <p className="text-xs font-inter text-muted">
                    Submission baru dari anggota tim akan muncul di sini.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2.5">
            {submissions.map((submission) => {
                const Icon = STATUS_META.icon;

                return (
                    <Link
                        key={submission.id}
                        href={taskDetailRoute(projectId, submission.taskId)}
                        className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-inter text-sm font-medium text-foreground">{submission.taskTitle}</h3>
                            <span
                                className={cn(
                                    "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-inter font-medium",
                                    STATUS_META.className
                                )}
                            >
                                <Icon className="size-3.5" />
                                {STATUS_META.label}
                            </span>
                        </div>

                        {submission.note ? (
                            <p className="line-clamp-2 whitespace-pre-wrap text-sm font-inter text-muted">
                                {submission.note}
                            </p>
                        ) : (
                            <p className="text-sm font-inter italic text-muted">Tidak ada catatan dari assignee.</p>
                        )}

                        <p className="text-[11px] font-inter text-muted">
                            Disubmit {formatDateTime(submission.submittedAt)}
                        </p>
                    </Link>
                );
            })}
        </div>
    );
}
