"use client";

import { useState, useTransition } from "react";
import { Loader2, Link2, FileText, Paperclip, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import AuthErrorBanner from "@/components/features/auth/AuthErrorBanner";
import { ActionDefinition } from "@/lib/api/tasks/taskStatus";
import {
    submitTaskAction,
    createAttachmentUploadUrlAction,
    createAttachmentAction,
} from "@/app/(main)/projects/[projectId]/task-board/actions";
import { cn } from "@/utils/cn";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

type PendingContent = { kind: "text" | "link"; value: string };

const MODAL_COPY: Record<"submit", { title: string; submitLabel: string }> = {
    submit: { title: "Submit hasil kerja", submitLabel: "Submit" },
};

type TaskActionModalProps = {
    definition: ActionDefinition | null;
    projectId: string;
    taskId: number;
    onClose: () => void;
};

export default function TaskActionModal({ definition, projectId, taskId, onClose }: TaskActionModalProps) {
    const [note, setNote] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [contents, setContents] = useState<PendingContent[]>([]);
    const [linkDraft, setLinkDraft] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [statusText, setStatusText] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (!definition || definition.action !== "submit") return null;
    const copy = MODAL_COPY.submit;

    function resetForm() {
        setNote("");
        setFiles([]);
        setContents([]);
        setLinkDraft("");
        setError(null);
        setStatusText(null);
    }

    function handleClose() {
        if (isPending) return;
        resetForm();
        onClose();
    }

    function handleFilesSelected(selected: FileList | null) {
        if (!selected) return;
        const next: File[] = [];
        for (const file of Array.from(selected)) {
            if (file.size > MAX_FILE_SIZE) {
                setError(`File "${file.name}" melebihi batas 10MB.`);
                continue;
            }
            next.push(file);
        }
        setFiles((prev) => [...prev, ...next]);
    }

    function addLink() {
        const value = linkDraft.trim();
        if (!value) return;
        setContents((prev) => [...prev, { kind: "link", value }]);
        setLinkDraft("");
    }

    function removeFile(index: number) {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    }

    function removeContent(index: number) {
        setContents((prev) => prev.filter((_, i) => i !== index));
    }

    function handleSubmit() {
        setError(null);

        startTransition(async () => {
            setStatusText("Mengirim submission...");
            const result = await submitTaskAction(projectId, taskId, note.trim() || undefined);
            if (!result.success || result.submissionId === null) {
                setError(result.error ?? "Gagal mengirim submission.");
                setStatusText(null);
                return;
            }

            const submissionId = result.submissionId;

            for (const content of contents) {
                setStatusText(`Menyimpan ${content.kind === "link" ? "tautan" : "catatan"}...`);
                const attachRes = await createAttachmentAction(projectId, taskId, submissionId, {
                    content: { type: content.kind, content: content.value },
                    file: null,
                });
                if (!attachRes.success) {
                    setError(attachRes.error ?? "Submission terkirim, tapi ada lampiran yang gagal disimpan.");
                    setStatusText(null);
                    handleClose();
                    return;
                }
            }

            for (const file of files) {
                setStatusText(`Mengupload ${file.name}...`);
                const isImage = file.type.startsWith("image/");
                const urlRes = await createAttachmentUploadUrlAction(submissionId, {
                    type: isImage ? "image" : "file",
                    fileName: file.name,
                    mimeType: file.type || "application/octet-stream",
                    fileSize: file.size,
                });

                if (!urlRes.success || !urlRes.uploadUrl || !urlRes.objectKey) {
                    setError(urlRes.error ?? "Submission terkirim, tapi ada file yang gagal diupload.");
                    setStatusText(null);
                    handleClose();
                    return;
                }

                try {
                    const putRes = await fetch(urlRes.uploadUrl, {
                        method: "PUT",
                        headers: { "Content-Type": file.type || "application/octet-stream" },
                        body: file,
                    });
                    if (!putRes.ok) throw new Error("upload failed");
                } catch {
                    setError(`Submission terkirim, tapi upload "${file.name}" gagal. Coba lampirkan ulang dari detail tugas.`);
                    setStatusText(null);
                    handleClose();
                    return;
                }

                const attachRes = await createAttachmentAction(projectId, taskId, submissionId, {
                    content: null,
                    file: {
                        type: isImage ? "image" : "file",
                        objectKey: urlRes.objectKey,
                        fileName: file.name,
                        mimeType: file.type || "application/octet-stream",
                        fileSize: file.size,
                    },
                });
                if (!attachRes.success) {
                    setError(attachRes.error ?? "Submission terkirim, tapi metadata file gagal disimpan.");
                    setStatusText(null);
                    handleClose();
                    return;
                }
            }

            setStatusText(null);
            resetForm();
            onClose();
        });
    }

    return (
        <Modal isOpen onClose={handleClose} title={copy.title}>
            <div className="flex flex-col gap-4">
                <AuthErrorBanner message={error} />

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="submission-note" className="text-sm font-inter font-medium text-foreground">
                        Catatan untuk leader
                    </label>
                    <textarea
                        id="submission-note"
                        rows={4}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Ceritakan apa yang sudah dikerjakan (opsional)"
                        maxLength={1000}
                        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-inter font-medium text-foreground">Lampiran (opsional)</span>

                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={linkDraft}
                            onChange={(e) => setLinkDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addLink();
                                }
                            }}
                            placeholder="Tempel tautan (mis. Figma, Google Docs)"
                            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary"
                        />
                        <button
                            type="button"
                            onClick={addLink}
                            className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-3 text-sm font-inter font-medium text-foreground transition-colors hover:border-primary"
                        >
                            <Link2 className="size-3.5" />
                            Tambah
                        </button>
                    </div>

                    <label className="flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-sm font-inter text-muted transition-colors hover:border-primary hover:text-foreground">
                        <Paperclip className="size-3.5" />
                        Pilih file atau gambar (maks 10MB)
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFilesSelected(e.target.files)}
                        />
                    </label>

                    {(contents.length > 0 || files.length > 0) && (
                        <ul className="flex flex-col gap-1.5">
                            {contents.map((content, index) => (
                                <li
                                    key={`content-${index}`}
                                    className="flex items-center gap-2 rounded-lg bg-status-todo-bg px-3 py-2 text-xs font-inter text-foreground"
                                >
                                    {content.kind === "link" ? (
                                        <Link2 className="size-3.5 shrink-0" />
                                    ) : (
                                        <FileText className="size-3.5 shrink-0" />
                                    )}
                                    <span className="min-w-0 flex-1 truncate">{content.value}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeContent(index)}
                                        aria-label="Hapus lampiran"
                                        className="shrink-0 text-muted hover:text-status-blocked-text"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </li>
                            ))}
                            {files.map((file, index) => (
                                <li
                                    key={`file-${index}`}
                                    className="flex items-center gap-2 rounded-lg bg-status-todo-bg px-3 py-2 text-xs font-inter text-foreground"
                                >
                                    <Paperclip className="size-3.5 shrink-0" />
                                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        aria-label="Hapus lampiran"
                                        className="shrink-0 text-muted hover:text-status-blocked-text"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

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
                        {isPending ? "Memproses..." : copy.submitLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
