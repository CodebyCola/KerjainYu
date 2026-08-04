"use client";

import Link from "next/link";
import { UserRound, Archive, HelpCircle, LogOut, X } from "lucide-react";
import { ROUTES } from "@/lib/routes";

type MoreSheetProps = {
    isOpen: boolean;
    onClose: () => void;
};

const SHEET_ITEMS = [
    { label: "Archive", href: ROUTES.ARCHIVE, icon: Archive },
    { label: "Help Center", href: ROUTES.HELP_CENTER, icon: HelpCircle },
];

export default function MoreSheet({ isOpen, onClose }: MoreSheetProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
                aria-hidden="true"
                onClick={onClose}
                className="absolute inset-0 bg-black/40"
            />

            {/* Sheet */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Menu lainnya"
                className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-card pb-6 pt-2"
            >
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />

                <div className="flex items-center justify-between px-4 pb-2">
                    <span className="text-sm font-inter font-semibold text-foreground">Lainnya</span>
                    <button type="button" aria-label="Tutup menu" onClick={onClose}>
                        <X className="size-5 text-muted" />
                    </button>
                </div>

                <div className="flex flex-col">
                    {SHEET_ITEMS.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            aria-label={`Buka halaman ${label}`}
                            onClick={onClose}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-inter text-foreground hover:bg-status-todo-bg"
                        >
                            <Icon className="size-5 text-muted" />
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}