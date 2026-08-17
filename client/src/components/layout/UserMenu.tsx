"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { LogOut, Settings, UserRound } from "lucide-react";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/getInitials";
import { type User } from "@/types/user";
import { useSession } from "@/contexts/SessionContext";
import { logoutAction } from "@/app/(main)/actions";

type UserMenuProps = {
    user?: User;
    align?: "left" | "right";
};

const MENU_ITEMS = [
    { label: "Profile", href: "/profile", icon: UserRound },
    { label: "Settings", href: "/settings", icon: Settings },
];

export default function UserMenu({ user: userProp, align = "right" }: UserMenuProps) {
    const sessionUser = useSession();
    const user = userProp ?? sessionUser ?? undefined;

    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, startLogoutTransition] = useTransition();
    const containerRef = useRef<HTMLDivElement>(null);
    const initials = getInitials(user?.username);

    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        const timeoutId = setTimeout(() => {
            document.addEventListener("click", handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                aria-label="Buka menu profil"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
                className="size-9 rounded-full bg-primary flex items-center justify-center overflow-hidden shrink-0"
            >
                {user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={user.avatarUrl}
                        alt={user?.username ?? "User avatar"}
                        className="size-full object-cover"
                    />
                ) : (
                    <span className="text-xs font-inter font-semibold text-primary-foreground">
                        {initials}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    role="menu"
                    className={cn(
                        "absolute top-full mt-2 w-48 rounded-lg border border-border bg-card py-1 shadow-lg z-50",
                        align === "right" ? "right-0" : "left-0"
                    )}
                >
                    {MENU_ITEMS.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            role="menuitem"
                            aria-label={`Buka halaman ${label}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm font-inter text-foreground hover:bg-status-todo-bg"
                        >
                            <Icon className="size-4 text-muted" />
                            {label}
                        </Link>
                    ))}

                    <button
                        type="button"
                        role="menuitem"
                        aria-label="Log out"
                        disabled={isLoggingOut}
                        onClick={() => {
                            setIsOpen(false);
                            startLogoutTransition(() => {
                                logoutAction();
                            });
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-inter text-status-blocked-text hover:bg-status-blocked-bg disabled:opacity-50"
                    >
                        <LogOut className="size-4" />
                        {isLoggingOut ? "Logging out..." : "Log out"}
                    </button>
                </div>
            )}
        </div>
    );
}