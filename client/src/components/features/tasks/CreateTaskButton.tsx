"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreateTaskModal from "@/components/features/tasks/CreateTaskModal";

type CreateTaskButtonProps = {
    projectId: string;
};

export default function CreateTaskButton({ projectId }: CreateTaskButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Buat tugas baru"
                className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:px-4"
            >
                <Plus className="size-4" />
                <span className="hidden sm:inline">Buat tugas</span>
            </button>

            <CreateTaskModal projectId={projectId} isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
