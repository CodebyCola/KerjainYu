"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Trash2, ExternalLink } from "lucide-react";
import { ProjectLink } from "@/types/project";
import { getCategoryMeta, getUrlHost } from "@/utils/projectLink";

type LinkListItemProps = {
    link: ProjectLink;
    canManage: boolean;
    onRemove: (link: ProjectLink) => void;
};

export default function LinkListItem({ link, canManage, onRemove }: LinkListItemProps) {
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

    const { label: categoryLabel, icon: CategoryIcon, bgClass, textClass } = getCategoryMeta(link.category);

    return (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
            <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-1 items-center gap-3"
            >
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${bgClass} ${textClass}`}>
                    <CategoryIcon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <p className="truncate font-inter text-sm font-semibold text-foreground">{link.label}</p>
                        <ExternalLink className="size-3 shrink-0 text-muted" aria-hidden="true" />
                    </div>
                    <p className="truncate text-xs font-inter text-muted">
                        {categoryLabel} · {getUrlHost(link.url)}
                    </p>
                </div>
            </a>

            {canManage && (
                <div ref={menuRef} className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        aria-label={`Aksi untuk ${link.label}`}
                        aria-haspopup="menu"
                        aria-expanded={isMenuOpen}
                        className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-status-todo-bg hover:text-foreground"
                    >
                        <MoreVertical className="size-4" />
                    </button>

                    {isMenuOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 top-[calc(100%+0.375rem)] z-10 min-w-44 rounded-lg border border-border bg-card p-1.5 shadow-lg"
                        >
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    onRemove(link);
                                    setIsMenuOpen(false);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-inter text-status-blocked-text transition-colors hover:bg-status-blocked-bg"
                            >
                                <Trash2 className="size-4" />
                                Hapus
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}