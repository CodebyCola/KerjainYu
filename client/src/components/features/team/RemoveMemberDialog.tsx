"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { TeamMember } from "@/types/team";

type RemoveMemberDialogProps = {
    member: TeamMember | null;
    isRemoving: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function RemoveMemberDialog({ member, isRemoving, onCancel, onConfirm }: RemoveMemberDialogProps) {
    const isPending = member?.status === "invited";

    return (
        <Modal isOpen={member !== null} onClose={onCancel} title="Keluarkan anggota?">
            {member && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3 rounded-lg bg-status-blocked-bg p-3">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-status-blocked-text" />
                        <p className="text-sm font-inter text-status-blocked-text">
                            {isPending
                                ? `Undangan untuk ${member.fullName ?? member.username} akan dibatalkan.`
                                : `${member.fullName ?? member.username} akan dikeluarkan dari proyek dan kehilangan akses ke seluruh tugasnya.`}
                        </p>
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isRemoving}
                            className="flex min-h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-inter font-medium text-foreground transition-colors hover:bg-status-todo-bg disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isRemoving}
                            aria-busy={isRemoving}
                            className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-status-blocked-text px-4 text-sm font-inter font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isRemoving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                            {isPending ? "Batalkan undangan" : isRemoving ? "Mengeluarkan..." : "Keluarkan"}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}