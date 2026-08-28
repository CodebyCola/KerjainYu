"use client";

import { useState, useTransition } from "react";
import { FolderOpen } from "lucide-react";
import { ProjectLink } from "@/types/project";
import LinkListItem from "@/components/features/links/LinkListItem";
import RemoveLinkDialog from "@/components/features/links/RemoveLinkDialog";
import { deleteLinkAction } from "@/app/(main)/projects/[projectId]/links/actions";

type LinkListProps = {
    projectId: string;
    links: ProjectLink[];
    canManage: boolean;
    onRemoved: (linkId: number) => void;
};

export default function LinkList({ projectId, links, canManage, onRemoved }: LinkListProps) {
    const [pendingRemoval, setPendingRemoval] = useState<ProjectLink | null>(null);
    const [removeError, setRemoveError] = useState<string | null>(null);
    const [isRemoving, startRemove] = useTransition();

    function handleRequestRemove(link: ProjectLink) {
        setRemoveError(null);
        setPendingRemoval(link);
    }

    function handleCancelRemove() {
        if (isRemoving) return;
        setPendingRemoval(null);
        setRemoveError(null);
    }

    function handleConfirmRemove() {
        if (!pendingRemoval) return;
        const target = pendingRemoval;

        startRemove(async () => {
            const result = await deleteLinkAction(projectId, target.id);
            if (!result.success) {
                setRemoveError(result.error ?? "Gagal menghapus berkas.");
                return;
            }
            onRemoved(target.id);
            setPendingRemoval(null);
        });
    }

    if (links.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                <FolderOpen className="size-8 text-muted" aria-hidden="true" />
                <p className="font-inter text-sm font-medium text-foreground">Belum ada berkas</p>
                <p className="max-w-xs text-sm font-inter text-muted">
                    {canManage
                        ? "Tambahkan tautan ke desain, repo, atau dokumen penting proyek ini."
                        : "Ketua proyek belum menambahkan tautan apa pun di sini."}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-2.5">
                {links.map((link) => (
                    <LinkListItem key={link.id} link={link} canManage={canManage} onRemove={handleRequestRemove} />
                ))}
            </div>

            <RemoveLinkDialog
                link={pendingRemoval}
                isPending={isRemoving}
                error={removeError}
                onCancel={handleCancelRemove}
                onConfirm={handleConfirmRemove}
            />
        </>
    );
}