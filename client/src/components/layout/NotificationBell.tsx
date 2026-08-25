"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import NotificationModal from "@/components/layout/NotificationModal";

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                aria-label="Notifikasi"
                onClick={() => setIsOpen(true)}
                className="relative"
            >
                <Bell size={22} className="text-muted" />
            </button>

            <NotificationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}