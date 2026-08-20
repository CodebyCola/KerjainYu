"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { ProjectLink } from "@/types/project";

type RemoveLinkDialogProps = {
    link: ProjectLink | null;
    isPending: boolean;
    error: string | null;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function RemoveLinkDialog({ link, isPending, error, onCancel, onConfirm }: RemoveLinkDialogProps) {
    return (
        <Modal isOpen={link !== null} onClose={onCancel} title="Hapus berkas?">
            {link && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3 rounded-lg bg-status-blocked-bg p-3">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-status-blocked-text" />
                        <p className="text-sm font-inter text-status-blocked-text">
                            &quot;{link.label}&quot; akan dihapus dari daftar berkas proyek ini.
                        </p>
                    </div>

                    {error && <p className="text-sm font-inter text-status-blocked-text">{error}</p>}

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isPending}
                            className="flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-inter font-medium text-foreground transition-colors hover:bg-status-todo-bg disabled:opacity-60 sm:min-h-10"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isPending}
                            aria-busy={isPending}
                            className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-status-blocked-text px-4 text-sm font-inter font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10"
                        >
                            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                            {isPending ? "Menghapus..." : "Hapus"}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}