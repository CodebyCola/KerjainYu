"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, ShieldCheck, UserMinus, Clock, Loader2 } from "lucide-react";
import { TeamMember } from "@/types/team";
import { getInitials } from "@/utils/getInitials";
import { cn } from "@/utils/cn";

type MemberListItemProps = {
    member: TeamMember;
    canManage: boolean;
    isPromoting: boolean;
    onMakeLeader: (member: TeamMember) => void;
    onRemove: (member: TeamMember) => void;
};

function formatJoinedAt(joinedAt: string | null) {
    if (!joinedAt) return null;
    return new Date(joinedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function MemberListItem({ member, canManage, isPromoting, onMakeLeader, onRemove }: MemberListItemProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isMenuOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (!menuRef.current?.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setIsMenuOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isMenuOpen]);

    const isPending = member.status === "invited";
    const showActions = canManage && member.role !== "leader";

    return (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
            <div
                className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-inter font-semibold",
                    member.role === "leader"
                        ? "bg-role-lead-bg text-role-lead-text"
                        : "bg-role-member-bg text-role-member-text"
                )}
            >
                {getInitials(member.fullName ?? member.username)}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="truncate font-inter text-sm font-semibold text-foreground">
                        {member.fullName ?? member.username}
                    </p>
                    {member.role === "leader" && (
                        <span className="flex items-center gap-1 rounded-full bg-role-lead-bg px-2 py-0.5 text-[11px] font-inter font-medium text-role-lead-text">
                            <ShieldCheck className="size-3" />
                            Ketua
                        </span>
                    )}
                    {isPromoting && (
                        <span className="flex items-center gap-1 text-[11px] font-inter font-medium text-muted">
                            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                            Menjadikan ketua...
                        </span>
                    )}
                    {isPending && (
                        <span className="flex items-center gap-1 rounded-full bg-status-progress-bg px-2 py-0.5 text-[11px] font-inter font-medium text-status-progress-text">
                            <Clock className="size-3" />
                            Pending
                        </span>
                    )}
                </div>
                <p className="truncate text-xs font-inter text-muted">
                    @{member.username}
                    {formatJoinedAt(member.joinedAt) && ` · Bergabung ${formatJoinedAt(member.joinedAt)}`}
                </p>
            </div>

            {showActions && (
                <div ref={menuRef} className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        aria-label="Aksi anggota"
                        aria-haspopup="menu"
                        aria-expanded={isMenuOpen}
                        className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-status-todo-bg hover:text-foreground"
                    >
                        <MoreVertical className="size-4" />
                    </button>

                    {isMenuOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 top-[calc(100%+0.375rem)] z-10 min-w-48 rounded-lg border border-border bg-card p-1.5 shadow-lg"
                        >
                            {!isPending && (
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        onMakeLeader(member);
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-inter text-foreground transition-colors hover:bg-status-todo-bg"
                                >
                                    <ShieldCheck className="size-4 text-muted" />
                                    Jadikan ketua
                                </button>
                            )}
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    onRemove(member);
                                    setIsMenuOpen(false);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-inter text-status-blocked-text transition-colors hover:bg-status-blocked-bg"
                            >
                                <UserMinus className="size-4" />
                                {isPending ? "Batalkan undangan" : "Keluarkan dari proyek"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}