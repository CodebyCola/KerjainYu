"use client";

import { useState, useTransition } from "react";
import { LogOut, Info } from "lucide-react";
import LeaveProjectDialog from "@/components/features/team/LeaveProjectDialog";
import { leaveProjectAction } from "@/app/(main)/projects/[projectId]/team/actions";

type LeaveProjectButtonProps = {
    projectId: string;
    projectTitle: string;
    isLeader: boolean;
    hasOtherActiveMembers: boolean;
};

export default function LeaveProjectButton({
    projectId,
    projectTitle,
    isLeader,
    hasOtherActiveMembers,
}: LeaveProjectButtonProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLeaving, startLeaveTransition] = useTransition();

    // Leader dengan member lain wajib memindahkan kepemimpinan dulu
    // sebelum bisa keluar, supaya proyek tidak pernah kosong ketua.
    const mustTransferLeadershipFirst = isLeader && hasOtherActiveMembers;

    function handleConfirm() {
        setError(null);
        startLeaveTransition(async () => {
            const result = await leaveProjectAction(projectId);
            // Kalau berhasil, action di atas sudah redirect duluan sehingga
            // baris di bawah ini tidak sempat jalan. Kalau sempat sampai
            // sini berarti memang gagal.
            if (!result.success) {
                setError(result.error ?? "Gagal keluar dari proyek.");
            }
        });
    }

    return (
        <>
            <div className="rounded-xl border border-status-blocked-text/20 bg-status-blocked-bg/40 p-4">
                <p className="font-inter text-sm font-semibold text-foreground">Keluar dari proyek</p>
                <p className="mt-1 text-sm font-inter text-muted">
                    Kamu akan kehilangan akses ke proyek ini dan seluruh tugas di dalamnya.
                </p>

                {mustTransferLeadershipFirst && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-background p-3">
                        <Info className="mt-0.5 size-4 shrink-0 text-muted" />
                        <p className="text-sm font-inter text-muted">
                            Kamu adalah ketua proyek ini. Jadikan anggota lain sebagai ketua terlebih dahulu lewat daftar anggota di atas sebelum kamu bisa keluar.
                        </p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setIsDialogOpen(true)}
                    disabled={mustTransferLeadershipFirst}
                    className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-status-blocked-text px-4 text-sm font-inter font-medium text-status-blocked-text transition-colors hover:bg-status-blocked-bg disabled:cursor-not-allowed disabled:border-border disabled:text-muted disabled:hover:bg-transparent sm:min-h-10 sm:w-auto"
                >
                    <LogOut className="size-4" />
                    Keluar dari Proyek
                </button>
            </div>

            <LeaveProjectDialog
                isOpen={isDialogOpen}
                projectTitle={projectTitle}
                isLeader={isLeader}
                isLeaving={isLeaving}
                error={error}
                onCancel={() => setIsDialogOpen(false)}
                onConfirm={handleConfirm}
            />
        </>
    );
}
