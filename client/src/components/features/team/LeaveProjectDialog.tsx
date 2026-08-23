"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";

type LeaveProjectDialogProps = {
    isOpen: boolean;
    projectTitle: string;
    isLeader: boolean;
    isLeaving: boolean;
    error: string | null;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function LeaveProjectDialog({
    isOpen,
    projectTitle,
    isLeader,
    isLeaving,
    error,
    onCancel,
    onConfirm,
}: LeaveProjectDialogProps) {
    return (
        <Modal isOpen={isOpen} onClose={isLeaving ? () => { } : onCancel} title="Keluar dari proyek?">
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 rounded-lg bg-status-blocked-bg p-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-status-blocked-text" />
                    <p className="text-sm font-inter text-status-blocked-text">
                        Kamu akan keluar dari <span className="font-semibold">{projectTitle}</span> dan kehilangan akses ke seluruh tugasnya. Tugas yang sedang kamu kerjakan akan otomatis dilepas.
                        {isLeader &&
                            " Karena kamu satu-satunya anggota, proyek ini akan ditinggalkan tanpa siapa pun."}
                    </p>
                </div>

                {error && (
                    <p className="text-sm font-inter text-status-blocked-text">{error}</p>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLeaving}
                        className="flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-inter font-medium text-foreground transition-colors hover:bg-status-todo-bg disabled:opacity-50 sm:min-h-10"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLeaving}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-status-blocked-text px-4 text-sm font-inter font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:min-h-10"
                    >
                        {isLeaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                        {isLeaving ? "Keluar..." : "Ya, keluar dari proyek"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
