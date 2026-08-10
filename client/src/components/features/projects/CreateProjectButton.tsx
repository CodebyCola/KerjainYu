"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreateProjectModal from "@/components/features/projects/CreateProjectModal";

export default function CreateProjectButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [openCount, setOpenCount] = useState(0);

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setOpenCount((count) => count + 1);
                    setIsOpen(true);
                }}
                aria-label="Buat proyek baru"
                className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:px-4"
            >
                <Plus className="size-4" />
                <span className="hidden sm:inline">Buat proyek</span>
            </button>

            <CreateProjectModal key={openCount} isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}