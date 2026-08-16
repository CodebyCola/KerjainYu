"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import AddMemberModal from "@/components/features/projects/AddMemberModal";

type AddMemberButtonProps = {
    projectId: string;
};

export default function AddMemberButton({ projectId }: AddMemberButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Tambah anggota"
                className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:px-4"
            >
                <UserPlus className="size-4" />
                <span className="hidden sm:inline">Tambah Anggota</span>
            </button>

            <AddMemberModal projectId={projectId} isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
