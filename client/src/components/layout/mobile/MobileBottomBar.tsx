"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { LucideIcon, Folder, ListChecks, List, Users, KanbanSquare, Calendar, } from "lucide-react";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { ROUTES, projectRoutes, getProjectIdFromPathname } from "@/lib/routes";
import MoreSheet from "@/components/layout/mobile/MoreSheet";

const MAIN_NAV_ITEMS = [
    { label: "Proyek", href: ROUTES.PROJECTS, icon: Folder },
    { label: "Tugas", href: ROUTES.MY_TASK, icon: ListChecks },
];

type BottomNavLinkProps = {
    label: string;
    href: string;
    icon: LucideIcon;
    isActive: boolean;
    ariaLabel: string;
};

function BottomNavLink({ label, href, icon: Icon, isActive, ariaLabel }: BottomNavLinkProps) {
    return (
        <Link
            href={href}
            aria-label={ariaLabel}
            aria-current={isActive ? "page" : undefined}
            className="flex items-center justify-center w-full"
        >
            <span
                className={cn(
                    "flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors",
                    isActive && "bg-primary"
                )}
            >
                <Icon className={cn("size-5", isActive ? "text-primary-foreground" : "text-muted")} />
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
    );
}

type MoreButtonProps = {
    isOpen: boolean;
    onOpen: () => void;
};

function MoreButton({ isOpen, onOpen }: MoreButtonProps) {
    return (
        <button
            type="button"
            aria-label="Buka menu lainnya"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            onClick={onOpen}
            className="flex items-center justify-center w-full"
        >
            <span className="flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors">
                <List className="size-5 text-muted" />
                <span className="font-inter font-medium text-[11px] leading-none text-muted">
                    Lainnya
                </span>
            </span>
        </button>
    );
}

export default function MobileBottomBar() {
    const pathname = usePathname();
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const projectId = getProjectIdFromPathname(pathname);

    if (projectId) {
        const routes = projectRoutes(projectId);
        const PROJECT_NAV_ITEMS = [
            { label: "Tugas", href: routes.TASK_BOARD, icon: KanbanSquare },
            { label: "Tim", href: routes.TEAM, icon: Users },
            { label: "Kalender", href: routes.CALENDAR, icon: Calendar },
        ];

        return (
            <nav aria-label="Navigasi proyek" className="h-16 border-t border-t-border bg-background">
                <ul className="flex items-center justify-between h-full px-2">
                    {PROJECT_NAV_ITEMS.map(({ label, href, icon }) => (
                        <li key={href} className="flex-1">
                            <BottomNavLink
                                label={label}
                                href={href}
                                icon={icon}
                                isActive={pathname === href}
                                ariaLabel={`Buka ${label}`}
                            />
                        </li>
                    ))}

                    <li className="flex-1">
                        <MoreButton isOpen={isMoreOpen} onOpen={() => setIsMoreOpen(true)} />
                    </li>
                </ul>

                <MoreSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} projectId={projectId} />
            </nav>
        );
    }

    return (
        <nav
            aria-label="Navigasi utama"
            className="h-16 border-t border-t-border bg-background"
        >
            <ul className="flex items-center justify-between h-full px-2">
                {MAIN_NAV_ITEMS.map(({ label, href, icon }) => (
                    <li key={href} className="flex-1">
                        <BottomNavLink
                            label={label}
                            href={href}
                            icon={icon}
                            isActive={pathname === href}
                            ariaLabel={`Buka halaman ${label}`}
                        />
                    </li>
                ))}

                <li className="flex-1">
                    <MoreButton isOpen={isMoreOpen} onOpen={() => setIsMoreOpen(true)} />
                </li>
            </ul>

            <MoreSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
        </nav>
    );
}
