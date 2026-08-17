"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Search, Send, Check, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { getInitials } from "@/utils/getInitials";
import { searchUsersAction, inviteMemberAction } from "@/app/(main)/projects/[projectId]/team/actions";
import { UserSearchResult } from "@/types/team";

type AddMemberModalProps = {
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
};

const SEARCH_DEBOUNCE_MS = 350;

export default function AddMemberModal({ projectId, isOpen, onClose }: AddMemberModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserSearchResult[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [invitedIds, setInvitedIds] = useState<number[]>([]);
    const [inviteErrors, setInviteErrors] = useState<Record<number, string>>({});
    const [invitingId, setInvitingId] = useState<number | null>(null);

    const [isSearching, startSearch] = useTransition();
    const [isInviting, startInvite] = useTransition();

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const requestIdRef = useRef(0);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const trimmed = query.trim();
        if (!trimmed) {
            return;
        }

        debounceRef.current = setTimeout(() => {
            const requestId = ++requestIdRef.current;
            startSearch(async () => {
                const state = await searchUsersAction(projectId, trimmed);
                if (requestId !== requestIdRef.current) return;
                setResults(state.results);
                setSearchError(state.error);
            });
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, projectId]);

    function handleQueryChange(value: string) {
        setQuery(value);
        if (!value.trim()) {
            requestIdRef.current += 1;
            setResults([]);
            setSearchError(null);
        }
    }

    function handleInvite(userId: number) {
        setInvitingId(userId);
        setInviteErrors((prev) => {
            const next = { ...prev };
            delete next[userId];
            return next;
        });

        startInvite(async () => {
            const result = await inviteMemberAction(projectId, userId);
            setInvitingId(null);

            if (!result.success) {
                setInviteErrors((prev) => ({
                    ...prev,
                    [userId]: result.error ?? "Gagal mengundang user.",
                }));
                return;
            }

            setInvitedIds((prev) => [...prev, userId]);
        });
    }

    function handleClose() {
        setQuery("");
        setResults([]);
        setSearchError(null);
        setInvitedIds([]);
        setInviteErrors({});
        setInvitingId(null);
        onClose();
    }

    const trimmedQuery = query.trim();
    const showMinLengthHint = trimmedQuery.length > 0 && trimmedQuery.length < 2;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Tambah Anggota">
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        placeholder="Cari username atau nama..."
                        autoFocus
                        className="w-full min-h-11 rounded-lg border border-border bg-background pl-9 pr-3 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary"
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted" aria-hidden="true" />
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    {showMinLengthHint && (
                        <p className="py-6 text-center text-sm font-inter text-muted">
                            Ketik minimal 2 karakter untuk mencari
                        </p>
                    )}

                    {searchError && (
                        <p className="py-2 text-center text-sm font-inter text-status-blocked-text">
                            {searchError}
                        </p>
                    )}

                    {!isSearching && !searchError && trimmedQuery.length >= 2 && results.length === 0 && (
                        <p className="py-6 text-center text-sm font-inter text-muted">
                            Tidak ada user dengan &quot;{query}&quot;
                        </p>
                    )}

                    {results.map((user) => {
                        const isInvited = invitedIds.includes(user.id);
                        const isPendingInvite = isInviting && invitingId === user.id;
                        const inviteError = inviteErrors[user.id];

                        return (
                            <div
                                key={user.id}
                                className="flex flex-col gap-1 rounded-lg border border-border p-2.5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-role-member-bg text-xs font-inter font-semibold text-role-member-text">
                                        {getInitials(user.fullName ?? user.username)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-inter text-sm font-medium text-foreground">
                                            {user.fullName ?? user.username}
                                        </p>
                                        <p className="truncate text-xs font-inter text-muted">@{user.username}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleInvite(user.id)}
                                        disabled={isInvited || isPendingInvite}
                                        className="flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-inter font-medium text-primary transition-colors disabled:cursor-not-allowed disabled:text-status-done-text"
                                    >
                                        {isInvited ? (
                                            <>
                                                <Check className="size-3.5" />
                                                Diundang
                                            </>
                                        ) : isPendingInvite ? (
                                            <>
                                                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                                                Mengundang...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="size-3.5" />
                                                Undang
                                            </>
                                        )}
                                    </button>
                                </div>
                                {inviteError && (
                                    <p className="pl-12 text-xs font-inter text-status-blocked-text">
                                        {inviteError}
                                    </p>
                                )}
                            </div>
                        );
                    })}

                    {!trimmedQuery && (
                        <p className="py-6 text-center text-sm font-inter text-muted">
                            Ketik username atau nama untuk mencari
                        </p>
                    )}
                </div>
            </div>
        </Modal>
    );
}