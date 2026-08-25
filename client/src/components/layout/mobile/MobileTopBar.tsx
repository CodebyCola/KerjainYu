"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { ROUTES, getProjectIdFromPathname } from "@/lib/routes";
import UserMenu from "@/components/layout/UserMenu";
import InvitationBell from "@/components/features/invitations/InvitationBell";
import SwapRequestBell from "@/components/features/task-detail/SwapRequestBell";
import Skeleton from "@/components/ui/Skeleton";
import { useProjectTitle } from "@/contexts/ProjectTitleContext";
import { type User } from "@/types/user";
import { getInitials } from "@/utils/getInitials";

type MobileTopBarProps = {
    user?: User;
};

export default function MobileTopBar({ user }: MobileTopBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const projectId = getProjectIdFromPathname(pathname);
    const { title } = useProjectTitle();

    return (
        <header className="h-16 border-b border-b-border bg-background">
            <div className="flex items-center justify-between h-full px-4">
                {projectId ? (
                    <button
                        type="button"
                        aria-label="Kembali ke daftar proyek"
                        onClick={() => router.push(ROUTES.PROJECTS)}
                        className="flex items-center gap-2 min-w-0"
                    >
                        <ArrowLeft className="size-5 text-foreground shrink-0" />
                        {/* aria-live: screen reader tetap announce judul begitu selesai
                            disinkronkan dari ProjectTitleSync (bisa sedikit delay dari server). */}
                        <div aria-live="polite" className="min-w-0 truncate">
                            {title ? (
                                <span className="text-sm font-inter font-semibold text-foreground">
                                    {title}
                                </span>
                            ) : (
                                <Skeleton className="h-4 w-24" />
                            )}
                        </div>
                    </button>
                ) : (
                    <div className="flex flex-row items-center gap-1">
                        <div className="size-9 rounded-lg bg-status-progress-bg flex items-center justify-center text-sm font-inter font-semibold text-status-progress-text shrink-0">
                            {getInitials(APP_NAME)}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4 shrink-0">
                    <SwapRequestBell />
                    <InvitationBell />
                    <UserMenu user={user} align="right" />
                </div>
            </div>
        </header>
    );
}