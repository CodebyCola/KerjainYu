"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import AuthErrorBanner from "@/components/features/auth/AuthErrorBanner";
import { useAttachmentUpload, PendingContent } from "@/lib/hooks/useAttachmentUpload";
import AttachmentComposer from "@/components/features/task-detail/AttachmentComposer";
import { cn } from "@/utils/cn";

type AddAttachmentModalProps = {
    isOpen: boolean;
    projectId: string;
    taskId: number;
    submissionId: number;
    onClose: () => void;
    onUploaded: () => void;
};

// Tambah lampiran susulan ke submission yang sudah dibuat (mis. setelah
// submit, assignee sadar ada file yang ketinggalan). Server menerima
// attachment baru selama reviewStatus masih pending/revision_requested.
export default function AddAttachmentModal({
    isOpen,
    projectId,
    taskId,
    submissionId,
    onClose,
    onUploaded,
}: AddAttachmentModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [contents, setContents] = useState<PendingContent[]>([]);
    const { uploadAll, isPending, startTransition, error, setError, statusText, setStatusText, reset } =
        useAttachmentUpload();

    if (!isOpen) return null;

    function resetForm() {
        setFiles([]);
        setContents([]);
        reset();
    }

    function handleClose() {
        if (isPending) return;
        resetForm();
        onClose();
    }

    function handleSubmit() {
        if (files.length === 0 && contents.length === 0) {
            setError("Pilih minimal satu file, gambar, atau tautan.");
            return;
        }

        setError(null);
        startTransition(async () => {
            const uploadError = await uploadAll({ projectId, taskId, submissionId, contents, files });
            setStatusText(null);

            if (uploadError) {
                setError(uploadError);
                return;
            }

            resetForm();
            onUploaded();
            onClose();
        });
    }

    return (
        <Modal isOpen onClose={handleClose} title="Tambah lampiran">
            <div className="flex flex-col gap-4">
                <AuthErrorBanner message={error} />

                <AttachmentComposer
                    contents={contents}
                    files={files}
                    onContentsChange={setContents}
                    onFilesChange={setFiles}
                    onError={setError}
                />

                {statusText && <p className="text-xs font-inter text-muted">{statusText}</p>}

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
                            "bg-primary text-primary-foreground hover:opacity-90"
                        )}
                    >
                        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                        {isPending ? "Mengupload..." : "Tambahkan"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
