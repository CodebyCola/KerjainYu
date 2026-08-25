"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import SwapRequestModal from "@/components/features/task-detail/SwapRequestModal";

export default function SwapRequestBell() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                aria-label="Permintaan tukar task"
                onClick={() => setIsOpen(true)}
                className="relative"
            >
                <ArrowLeftRight size={22} className="text-muted" />
            </button>

            <SwapRequestModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}