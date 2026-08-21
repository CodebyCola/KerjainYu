"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore } from "lucide-react";
import { setProjectArchivedAction } from "@/app/(main)/projects/[projectId]/settings/actions";
import SettingsSection from "@/components/features/settings/SettingsSection";
import ConfirmDangerDialog from "@/components/features/settings/ConfirmDangerDialog";

type ArchiveProjectCardProps = {
    projectId: string;
    projectTitle: string;
    isArchived: boolean;
    canManage: boolean;
};

export default function ArchiveProjectCard({ projectId, projectTitle, isArchived, canManage }: ArchiveProjectCardProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleConfirm() {
        setError(null);
        startTransition(async () => {
            const result = await setProjectArchivedAction(projectId, !isArchived);
            if (!result.success) {
                setError(result.error ?? "Gagal memperbarui status arsip.");
                return;
            }
            setIsDialogOpen(false);
            router.refresh();
        });
    }

    const Icon = isArchived ? ArchiveRestore : Archive;
    const actionLabel = isArchived ? "Aktifkan kembali" : "Arsipkan proyek";

    return (
        <SettingsSection
            icon={Icon}
            title="Arsip Proyek"
            description={
                isArchived
                    ? "Proyek ini sedang diarsipkan dan disembunyikan dari daftar proyek aktif."
                    : "Sembunyikan proyek dari daftar aktif tanpa menghapus datanya. Bisa diaktifkan kembali kapan saja."
            }
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-inter text-foreground">
                    Status saat ini:{" "}
                    <span className="font-medium">{isArchived ? "Diarsipkan" : "Aktif"}</span>
                </p>

                {canManage && (
                    <button
                        type="button"
                        onClick={() => setIsDialogOpen(true)}
                        className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-inter font-medium text-foreground transition-colors hover:border-primary sm:w-auto"
                    >
                        <Icon className="size-4" />
                        {actionLabel}
                    </button>
                )}
            </div>

            {!canManage && (
                <p className="mt-3 text-xs font-inter text-muted">
                    Hanya ketua proyek yang bisa mengarsipkan proyek ini.
                </p>
            )}

            <ConfirmDangerDialog
                isOpen={isDialogOpen}
                title={isArchived ? "Aktifkan kembali proyek?" : "Arsipkan proyek?"}
                message={
                    isArchived
                        ? `"${projectTitle}" akan muncul kembali di daftar proyek aktif.`
                        : `"${projectTitle}" akan dipindahkan ke arsip dan tidak muncul di daftar proyek aktif. Kamu bisa mengaktifkannya lagi kapan saja.`
                }
                confirmLabel={actionLabel}
                isPending={isPending}
                error={error}
                onCancel={() => setIsDialogOpen(false)}
                onConfirm={handleConfirm}
            />
        </SettingsSection>
    );
}
