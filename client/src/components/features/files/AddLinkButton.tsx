"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddLinkModal from "@/components/features/files/AddLinkModal";
import { ProjectLink } from "@/types/project";

type AddLinkButtonProps = {
    projectId: string;
    onAdded: (link: ProjectLink) => void;
};

export default function AddLinkButton({ projectId, onAdded }: AddLinkButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Tambah berkas"
                className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:px-4"
            >
                <Plus className="size-4" />
                <span className="hidden sm:inline">Tambah Berkas</span>
            </button>

            <AddLinkModal
                projectId={projectId}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onAdded={onAdded}
            />
        </>
    );
}