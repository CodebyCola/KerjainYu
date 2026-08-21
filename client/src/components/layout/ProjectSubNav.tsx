"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, KanbanSquare, Calendar, FolderOpen, Settings } from "lucide-react";
import { cn } from "@/utils/cn";
import { projectRoutes } from "@/lib/routes";

type ProjectSubNavProps = {
    projectId: string;
};

export default function ProjectSubNav({ projectId }: ProjectSubNavProps) {
    const pathname = usePathname();
    const routes = projectRoutes(projectId);

    const NAV_ITEMS = [
        { label: "Papan Tugas", href: routes.TASK_BOARD, icon: KanbanSquare },
        { label: "Tim", href: routes.TEAM, icon: Users },
        { label: "Kalender", href: routes.CALENDAR, icon: Calendar },
        { label: "Berkas", href: routes.FILES, icon: FolderOpen },
        { label: "Pengaturan", href: routes.SETTINGS, icon: Settings },
    ];

    return (
        <nav
            aria-label="Navigasi proyek"
            className="h-12 w-full border-b border-b-border bg-background shrink-0"
        >
            <div className="flex items-center h-full px-6 gap-1">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-label={`Buka ${label}`}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-inter font-medium transition-colors",
                                isActive
                                    ? "bg-status-progress-bg text-status-progress-text"
                                    : "text-muted hover:bg-status-todo-bg hover:text-foreground"
                            )}
                        >
                            <Icon className="size-4" />
                            {label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
