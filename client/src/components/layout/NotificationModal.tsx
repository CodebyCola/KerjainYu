"use client";

import { useEffect, useState, useTransition } from "react";
import Modal from "@/components/ui/Modal";
import InvitationListItem from "@/components/features/invitations/InvitationListItem";
import SwapRequestListItem from "@/components/features/task-detail/SwapRequestListItem";
import { getMyInvitationsAction, respondToInvitationAction } from "@/app/(main)/invitations/actions";
import {
    getMyIncomingSwapRequestsAction,
    respondToSwapRequestAction,
} from "@/app/(main)/projects/[projectId]/task-board/actions";
import { Invitation } from "@/types/team";
import { TaskSwapRequestListItem } from "@/types/task";
import { cn } from "@/utils/cn";

type NotificationModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

type Tab = "invitations" | "swaps";

// Satu modal notifikasi buat undangan project & permintaan tukar task,
// gantiin dua modal terpisah (AcceptInvitationModal + SwapRequestModal) yang
// dulu sama-sama selalu mounted di topbar tiap breakpoint sekaligus.
export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
    const [tab, setTab] = useState<Tab>("invitations");

    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [invitationError, setInvitationError] = useState<string | null>(null);
    const [respondingInvitationId, setRespondingInvitationId] = useState<number | null>(null);
    const [invitationErrors, setInvitationErrors] = useState<Record<number, string>>({});

    const [swapRequests, setSwapRequests] = useState<TaskSwapRequestListItem[]>([]);
    const [swapError, setSwapError] = useState<string | null>(null);
    const [respondingSwapId, setRespondingSwapId] = useState<number | null>(null);
    const [swapErrors, setSwapErrors] = useState<Record<number, string>>({});

    const [isLoading, startLoad] = useTransition();
    const [isResponding, startRespond] = useTransition();

    // Muat ulang kedua daftar tiap kali modal dibuka, biar badge/tab selalu segar.
    useEffect(() => {
        if (!isOpen) return;

        startLoad(async () => {
            setInvitationError(null);
            setSwapError(null);

            const [invitationResult, swapResult] = await Promise.allSettled([
                getMyInvitationsAction(),
                getMyIncomingSwapRequestsAction(),
            ]);

            if (invitationResult.status === "fulfilled") {
                setInvitations(invitationResult.value);
            } else {
                setInvitationError("Gagal memuat undangan. Coba lagi.");
            }

            if (swapResult.status === "fulfilled") {
                setSwapRequests(swapResult.value);
            } else {
                setSwapError("Gagal memuat permintaan tukar task. Coba lagi.");
            }
        });
    }, [isOpen]);

    function handleRespondInvitation(invitation: Invitation, status: "accept" | "reject") {
        setRespondingInvitationId(invitation.id);
        setInvitationErrors((prev) => {
            const next = { ...prev };
            delete next[invitation.id];
            return next;
        });

        startRespond(async () => {
            const result = await respondToInvitationAction(invitation.id, status);
            setRespondingInvitationId(null);

            if (!result.success) {
                setInvitationErrors((prev) => ({
                    ...prev,
                    [invitation.id]: result.error ?? "Gagal merespons undangan.",
                }));
                return;
            }

            setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
        });
    }

    function handleRespondSwap(request: TaskSwapRequestListItem, status: "approved" | "rejected") {
        setRespondingSwapId(request.id);
        setSwapErrors((prev) => {
            const next = { ...prev };
            delete next[request.id];
            return next;
        });

        startRespond(async () => {
            const result = await respondToSwapRequestAction(
                request.id,
                status,
                String(request.task.projectId),
            );
            setRespondingSwapId(null);

            if (!result.success) {
                setSwapErrors((prev) => ({
                    ...prev,
                    [request.id]: result.error ?? "Gagal merespons permintaan tukar task.",
                }));
                return;
            }

            setSwapRequests((prev) => prev.filter((r) => r.id !== request.id));
        });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Notifikasi">
            <div className="flex flex-col gap-3">
                <div className="flex gap-1 rounded-lg bg-status-todo-bg p-1">
                    <button
                        type="button"
                        onClick={() => setTab("invitations")}
                        className={cn(
                            "flex-1 rounded-md px-3 py-1.5 text-sm font-inter font-medium transition-colors",
                            tab === "invitations"
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted hover:text-foreground"
                        )}
                    >
                        Undangan{invitations.length > 0 ? ` (${invitations.length})` : ""}
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("swaps")}
                        className={cn(
                            "flex-1 rounded-md px-3 py-1.5 text-sm font-inter font-medium transition-colors",
                            tab === "swaps"
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted hover:text-foreground"
                        )}
                    >
                        Tukar Task{swapRequests.length > 0 ? ` (${swapRequests.length})` : ""}
                    </button>
                </div>

                <div className="flex flex-col gap-1.5">
                    {isLoading && (
                        <p className="py-6 text-center text-sm font-inter text-muted">Memuat...</p>
                    )}

                    {!isLoading && tab === "invitations" && (
                        <>
                            {invitationError && (
                                <p className="py-6 text-center text-sm font-inter text-status-blocked-text">
                                    {invitationError}
                                </p>
                            )}
                            {!invitationError && invitations.length === 0 && (
                                <p className="py-6 text-center text-sm font-inter text-muted">
                                    Tidak ada undangan proyek saat ini.
                                </p>
                            )}
                            {!invitationError &&
                                invitations.map((invitation) => (
                                    <InvitationListItem
                                        key={invitation.id}
                                        invitation={invitation}
                                        isResponding={isResponding && respondingInvitationId === invitation.id}
                                        error={invitationErrors[invitation.id] ?? null}
                                        onAccept={(inv) => handleRespondInvitation(inv, "accept")}
                                        onReject={(inv) => handleRespondInvitation(inv, "reject")}
                                    />
                                ))}
                        </>
                    )}

                    {!isLoading && tab === "swaps" && (
                        <>
                            {swapError && (
                                <p className="py-6 text-center text-sm font-inter text-status-blocked-text">
                                    {swapError}
                                </p>
                            )}
                            {!swapError && swapRequests.length === 0 && (
                                <p className="py-6 text-center text-sm font-inter text-muted">
                                    Tidak ada permintaan tukar task saat ini.
                                </p>
                            )}
                            {!swapError &&
                                swapRequests.map((request) => (
                                    <SwapRequestListItem
                                        key={request.id}
                                        request={request}
                                        isResponding={isResponding && respondingSwapId === request.id}
                                        error={swapErrors[request.id] ?? null}
                                        onAccept={(r) => handleRespondSwap(r, "approved")}
                                        onReject={(r) => handleRespondSwap(r, "rejected")}
                                    />
                                ))}
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}