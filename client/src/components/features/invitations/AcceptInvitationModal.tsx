"use client";

import { useEffect, useState, useTransition } from "react";
import Modal from "@/components/ui/Modal";
import InvitationListItem from "@/components/features/invitations/InvitationListItem";
import { getMyInvitationsAction, respondToInvitationAction } from "@/app/(main)/invitations/actions";
import { Invitation } from "@/types/team";

type AcceptInvitationModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function AcceptInvitationModal({ isOpen, onClose }: AcceptInvitationModalProps) {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [respondingId, setRespondingId] = useState<number | null>(null);
    const [respondErrors, setRespondErrors] = useState<Record<number, string>>({});

    const [isLoading, startLoad] = useTransition();
    const [isResponding, startRespond] = useTransition();

    // Muat ulang daftar undangan tiap kali modal dibuka.
    useEffect(() => {
        if (!isOpen) return;

        startLoad(async () => {
            setLoadError(null);
            try {
                const data = await getMyInvitationsAction();
                setInvitations(data);
            } catch {
                setLoadError("Gagal memuat undangan. Coba lagi.");
            }
        });
    }, [isOpen]);

    function handleRespond(invitation: Invitation, status: "accept" | "reject") {
        setRespondingId(invitation.id);
        setRespondErrors((prev) => {
            const next = { ...prev };
            delete next[invitation.id];
            return next;
        });

        startRespond(async () => {
            const result = await respondToInvitationAction(invitation.id, status);
            setRespondingId(null);

            if (!result.success) {
                setRespondErrors((prev) => ({
                    ...prev,
                    [invitation.id]: result.error ?? "Gagal merespons undangan.",
                }));
                return;
            }

            setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
        });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Undangan Proyek">
            <div className="flex flex-col gap-1.5">
                {isLoading && (
                    <p className="py-6 text-center text-sm font-inter text-muted">Memuat undangan...</p>
                )}

                {!isLoading && loadError && (
                    <p className="py-6 text-center text-sm font-inter text-status-blocked-text">{loadError}</p>
                )}

                {!isLoading && !loadError && invitations.length === 0 && (
                    <p className="py-6 text-center text-sm font-inter text-muted">
                        Tidak ada undangan proyek saat ini.
                    </p>
                )}

                {!isLoading &&
                    !loadError &&
                    invitations.map((invitation) => (
                        <InvitationListItem
                            key={invitation.id}
                            invitation={invitation}
                            isResponding={isResponding && respondingId === invitation.id}
                            error={respondErrors[invitation.id] ?? null}
                            onAccept={(inv) => handleRespond(inv, "accept")}
                            onReject={(inv) => handleRespond(inv, "reject")}
                        />
                    ))}
            </div>
        </Modal>
    );
}
