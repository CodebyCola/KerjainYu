"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import NotificationModal from "@/components/layout/NotificationModal";
import { useNotificationCount } from "@/contexts/NotificationCountContext";
import { markAllNotificationsAsReadAction } from "@/app/(main)/notifications/actions";

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { count, resetCount, restoreCount } = useNotificationCount();

    function handleOpen() {
        setIsOpen(true);

        // Reset optimistic dulu biar badge langsung hilang, tapi tetap
        // persist ke server -- kalau gagal, angkanya balikin lagi supaya
        // badge gak "bohong" (hilang di UI tapi notifnya masih unread di DB).
        const previousCount = count;
        resetCount();

        markAllNotificationsAsReadAction().then((result) => {
            if (!result.success) {
                restoreCount(previousCount);
            }
        });
    }

    return (
        <>
            <button
                type="button"
                aria-label={
                    count > 0 ? `Notifikasi, ${count} belum dibaca` : "Notifikasi"
                }
                onClick={handleOpen}
                className="relative"
            >
                <Bell size={22} className="text-muted" />
                {count > 0 && (
                    <span
                        aria-hidden="true"
                        className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-blocked-text px-1 text-[10px] font-inter font-semibold text-white"
                    >
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </button>

            <NotificationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}