"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Folder, ListChecks, Bell, List } from "lucide-react";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import MoreSheet from "@/components/layout/mobile/MoreSheet";

const NAV_ITEMS = [
    {
        label: "Proyek",
        href: ROUTES.PROJECTS,
        icon: Folder,
    },
    {
        label: "Tugas",
        href: ROUTES.MY_TASK,
        icon: ListChecks,
    },
    {
        label: "Notifikasi",
        href: ROUTES.NOTIFICATION,
        icon: Bell,
    },
];

export default function MobileBottomBar() {
    const pathname = usePathname();
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    return (
        <nav
            aria-label="Navigasi utama"
            className="h-16 border-t border-t-border bg-background"
        >
            <ul className="flex items-center justify-between h-full px-2">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;

                    return (
                        <li key={href} className="flex-1">
                            <Link
                                href={href}
                                aria-label={`Buka halaman ${label}`}
                                aria-current={isActive ? "page" : undefined}
                                className="flex items-center justify-center w-full"
                            >
                                <span
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors",
                                        isActive && "bg-primary"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "size-5",
                                            isActive ? "text-primary-foreground" : "text-muted"
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            "font-inter font-medium text-[11px] leading-none",
                                            isActive ? "text-primary-foreground" : "text-muted"
                                        )}
                                    >
                                        {label}
                                    </span>
                                </span>
                            </Link>
                        </li>
                    );
                })}

                <li className="flex-1">
                    <button
                        type="button"
                        aria-label="Buka menu lainnya"
                        aria-haspopup="dialog"
                        aria-expanded={isMoreOpen}
                        onClick={() => setIsMoreOpen(true)}
                        className="flex items-center justify-center w-full"
                    >
                        <span className="flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors">
                            <List className="size-5 text-muted" />
                            <span className="font-inter font-medium text-[11px] leading-none text-muted">
                                Lainnya
                            </span>
                        </span>
                    </button>
                </li>
            </ul>

            <MoreSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
        </nav>
    );
}