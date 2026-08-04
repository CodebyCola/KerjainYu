"use client";

import { usePathname } from "next/navigation";
import { Folder, ListChecks, UserPlus, HelpCircle, Archive } from "lucide-react";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/getInitials";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const NAV_ITEMS = [
    { label: "Projects", href: ROUTES.PROJECTS, icon: Folder },
    { label: "My Tasks", href: ROUTES.MY_TASK, icon: ListChecks },
];

type SidebarProps = {
    variant?: "icon-only" | "full";
};

export default function Sidebar({ variant = "full" }: SidebarProps) {
    const pathname = usePathname();
    const isIconOnly = variant === "icon-only";

    return (
        <aside
            aria-label="Sidebar navigasi"
            className={cn(
                "h-full shrink-0 border-r border-r-border bg-background flex flex-col py-4",
                isIconOnly ? "w-16 items-center" : "w-60 px-4"
            )}
        >
            {/* Brand */}
            <div className={cn("flex items-center mb-6", isIconOnly ? "justify-center" : "gap-2 px-1")}>
                <div className="size-8 rounded-lg bg-status-progress-bg flex items-center justify-center text-xs font-semibold text-status-progress-text">
                    {getInitials(APP_NAME)}
                </div>
                {!isIconOnly && (
                    <span className="text-sm font-inter font-semibold text-foreground">
                        {APP_NAME}
                    </span>
                )}
            </div>

            {/* Nav */}
            <nav aria-label="Navigasi utama" className="flex flex-col gap-1 w-full">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-label={`Buka halaman ${label}`}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "flex items-center rounded-lg transition-colors",
                                isIconOnly ? "justify-center size-9 mx-auto" : "gap-3 px-3 py-2",
                                isActive ? "bg-status-progress-bg" : "hover:bg-status-todo-bg"
                            )}
                        >
                            <Icon
                                className={cn("size-4.5", isActive ? "text-status-progress-text" : "text-muted")}
                            />
                            {!isIconOnly && (
                                <span
                                    className={cn(
                                        "text-sm font-inter font-medium",
                                        isActive ? "text-status-progress-text" : "text-foreground"
                                    )}
                                >
                                    {label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="flex-1" />

            {/* Bottom actions */}
            <div className="flex flex-col gap-1 w-full pt-5 border-t border-t-border">
                <button
                    type="button"
                    aria-label="Invite member"
                    className={cn(
                        "flex items-center rounded-lg bg-primary text-primary-foreground",
                        isIconOnly ? "justify-center size-9 mx-auto" : "gap-2 px-3 py-2"
                    )}
                >
                    <UserPlus className="size-4.5" />
                    {!isIconOnly && <span className="text-sm font-inter font-medium">Invite Member</span>}
                </button>

                <Link
                    href="/help"
                    aria-label="Buka halaman Help Center"
                    className={cn(
                        "flex items-center rounded-lg",
                        isIconOnly ? "justify-center size-9 mx-auto" : "gap-3 px-3 py-2"
                    )}
                >
                    <HelpCircle className="size-4.5 text-muted" />
                    {!isIconOnly && <span className="text-sm font-inter text-muted">Help Center</span>}
                </Link>

                <Link
                    href="/archive"
                    aria-label="Buka halaman Archive"
                    className={cn(
                        "flex items-center rounded-lg",
                        isIconOnly ? "justify-center size-9 mx-auto" : "gap-3 px-3 py-2"
                    )}
                >
                    <Archive className="size-4.5 text-muted" />
                    {!isIconOnly && <span className="text-sm font-inter text-muted">Archive</span>}
                </Link>
            </div>
        </aside>
    );
}