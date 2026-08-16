"use client";

import { useMemo, useState } from "react";
import { Search, Send, Check } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { getInitials } from "@/utils/getInitials";
import { DUMMY_SEARCHABLE_USERS } from "@/lib/api/projects/dummyTeamData";

type AddMemberModalProps = {
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
};

// TODO: ganti dengan GET /api/v1/users/search?q= begitu endpoint tersedia.
// Lihat README bagian "GET /api/v1/users/search".
function searchDummyUsers(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return DUMMY_SEARCHABLE_USERS.filter(
        (user) => user.username.toLowerCase().includes(q) || user.fullName?.toLowerCase().includes(q)
    );
}

export default function AddMemberModal({ projectId, isOpen, onClose }: AddMemberModalProps) {
    const [query, setQuery] = useState("");
    const [invitedIds, setInvitedIds] = useState<number[]>([]);

    const results = useMemo(() => searchDummyUsers(query), [query]);

    function handleInvite(userId: number) {
        // TODO: panggil POST /api/v1/project/:id/members { userId } begitu
        // endpoint tersedia. Lihat README bagian "POST /api/v1/project/:id/members".
        console.log(`[dummy] undang userId=${userId} ke project ${projectId}`);
        setInvitedIds((prev) => [...prev, userId]);
    }

    function handleClose() {
        setQuery("");
        setInvitedIds([]);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Tambah Anggota">
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari username atau nama..."
                        autoFocus
                        className="w-full min-h-11 rounded-lg border border-border bg-background pl-9 pr-3 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    {query.trim() && results.length === 0 && (
                        <p className="py-6 text-center text-sm font-inter text-muted">
                            Tidak ada user dengan &quot;{query}&quot;
                        </p>
                    )}

                    {results.map((user) => {
                        const isInvited = invitedIds.includes(user.id);
                        return (
                            <div
                                key={user.id}
                                className="flex items-center gap-3 rounded-lg border border-border p-2.5"
                            >
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
                                    disabled={isInvited}
                                    className="flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-inter font-medium text-primary transition-colors disabled:cursor-not-allowed disabled:text-status-done-text"
                                >
                                    {isInvited ? (
                                        <>
                                            <Check className="size-3.5" />
                                            Diundang
                                        </>
                                    ) : (
                                        <>
                                            <Send className="size-3.5" />
                                            Undang
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}

                    {!query.trim() && (
                        <p className="py-6 text-center text-sm font-inter text-muted">
                            Ketik username atau nama untuk mencari
                        </p>
                    )}
                </div>
            </div>
        </Modal>
    );
}
