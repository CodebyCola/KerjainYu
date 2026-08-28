"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import AuthErrorBanner from "@/components/features/auth/AuthErrorBanner";
import { ActionDefinition } from "@/lib/api/tasks/taskStatus";
import { reviewSubmissionAction } from "@/app/(main)/projects/[projectId]/task-board/actions";
import { cn } from "@/utils/cn";

type ReviewAction = "approve" | "requestRevision" | "reject";

const REVIEW_STATUS_MAP: Record<ReviewAction, "approved" | "revision_requested" | "rejected"> = {
    approve: "approved",
    requestRevision: "revision_requested",
    reject: "rejected",
};

type ReviewCopy = {
    title: string;
    noteLabel: string;
    noteRequired: boolean;
    placeholder: string;
    submitLabel: string;
};

const MODAL_COPY: Record<ReviewAction, ReviewCopy> = {
    approve: {
        title: "Setujui submission",
        noteLabel: "Catatan untuk assignee",
        noteRequired: false,
        placeholder: "Catatan tambahan (opsional)",
        submitLabel: "Setujui",
    },
    requestRevision: {
        title: "Minta revisi",
        noteLabel: "Catatan revisi",
        noteRequired: true,
        placeholder: "Jelaskan apa yang perlu diperbaiki",
        submitLabel: "Kirim permintaan revisi",
    },
    reject: {
        title: "Tolak submission",
        noteLabel: "Alasan penolakan",
        noteRequired: true,
        placeholder: "Jelaskan alasan submission ini ditolak",
        submitLabel: "Tolak submission",
    },
};

function isReviewAction(action: ActionDefinition["action"]): action is ReviewAction {
    return action === "approve" || action === "requestRevision" || action === "reject";
}

const SUBMIT_BUTTON_STYLE: Record<ActionDefinition["variant"], string> = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    default: "bg-primary text-primary-foreground hover:opacity-90",
    danger: "bg-status-blocked-text text-white hover:opacity-90",
};

type TaskReviewModalProps = {
    definition: ActionDefinition | null;
    projectId: string;
    taskId: number;
    submissionId: number | null;
    onClose: () => void;
};

// PATCH /submissions/:id/review — butuh submissionId dari task.latestSubmission,
// bukan taskId. reviewNote wajib diisi untuk revisi/tolak (server menolak
// 400 kalau kosong), opsional untuk approve.
export default function TaskReviewModal({
    definition,
    projectId,
    taskId,
    submissionId,
    onClose,
}: TaskReviewModalProps) {
    const router = useRouter();
    const [note, setNote] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const reviewAction = definition && isReviewAction(definition.action) ? definition.action : null;

    function handleClose() {
        if (isPending) return;
        setNote("");
        setError(null);
        onClose();
    }

    if (!definition || !reviewAction) return null;
    const copy = MODAL_COPY[reviewAction];

    if (submissionId === null) {
        return (
            <Modal isOpen onClose={handleClose} title={copy.title}>
                <AuthErrorBanner message="Submission untuk tugas ini tidak ditemukan. Muat ulang halaman dan coba lagi." />
            </Modal>
        );
    }

    function handleSubmit() {
        const trimmedNote = note.trim();
        if (copy.noteRequired && !trimmedNote) {
            setError(`${copy.noteLabel} wajib diisi.`);
            return;
        }

        setError(null);
        startTransition(async () => {
            const result = await reviewSubmissionAction(
                projectId,
                taskId,
                submissionId as number,
                REVIEW_STATUS_MAP[reviewAction as ReviewAction],
                trimmedNote || undefined,
            );
            if (!result.success) {
                setError(result.error);
                return;
            }
            setNote("");
            onClose();
            router.refresh();
        });
    }

    return (
        <Modal isOpen onClose={handleClose} title={copy.title}>
            <div className="flex flex-col gap-4">
                <AuthErrorBanner message={error} />

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="review-note" className="text-sm font-inter font-medium text-foreground">
                        {copy.noteLabel}
                        {copy.noteRequired && <span className="text-status-blocked-text"> *</span>}
                    </label>
                    <textarea
                        id="review-note"
                        rows={4}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        required={copy.noteRequired}
                        placeholder={copy.placeholder}
                        maxLength={1000}
                        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary"
                    />
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isPending}
                        className="flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-inter font-medium text-foreground transition-colors hover:bg-status-todo-bg disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isPending}
                        aria-busy={isPending}
                        className={cn(
                            "flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-inter font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10",
                            SUBMIT_BUTTON_STYLE[definition.variant]
                        )}
                    >
                        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                        {isPending ? "Memproses..." : copy.submitLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
