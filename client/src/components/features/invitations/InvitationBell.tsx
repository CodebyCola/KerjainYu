"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import AcceptInvitationModal from "@/components/features/invitations/AcceptInvitationModal";

export default function InvitationBell() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                aria-label="Undangan proyek"
                onClick={() => setIsOpen(true)}
                className="relative"
            >
                <Bell size={22} className="text-muted" />
            </button>

            <AcceptInvitationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
