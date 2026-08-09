"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/lib/routes";

const AUTH_TABS = [
    { key: "login", label: "Login", href: ROUTES.LOGIN, icon: LogIn },
    { key: "register", label: "Register", href: ROUTES.REGISTER, icon: UserPlus },
] as const;

export default function AuthNavCard() {
    const pathname = usePathname();
    const activeIndex = pathname?.startsWith(ROUTES.REGISTER) ? 1 : 0;

    return (
        <nav
            aria-label="Navigasi login dan register"
            className="relative grid grid-cols-2 rounded-full border border-border bg-card p-1 shadow-sm"
        >
            {/* Sliding indicator */}
            <span
                aria-hidden="true"
                className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${activeIndex * 100}%)` }}
            />

            {AUTH_TABS.map(({ key, label, href, icon: Icon }, index) => {
                const isActive = activeIndex === index;

                return (
                    <Link
                        key={key}
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                            "relative z-10 flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-inter font-medium transition-colors duration-300",
                            isActive ? "text-primary-foreground" : "text-muted hover:text-foreground"
                        )}
                    >
                        <Icon className="size-4" />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}