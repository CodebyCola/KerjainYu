"use client";

import { useEffect, useState, useTransition } from "react";
import Modal from "@/components/ui/Modal";
import SwapRequestListItem from "@/components/features/task-detail/SwapRequestListItem";
import {
    getMyIncomingSwapRequestsAction,
    respondToSwapRequestAction,
} from "@/app/(main)/projects/[projectId]/task-board/actions";
import { TaskSwapRequestListItem } from "@/types/task";

type SwapRequestModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function SwapRequestModal({ isOpen, onClose }: SwapRequestModalProps) {
    const [requests, setRequests] = useState<TaskSwapRequestListItem[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [respondingId, setRespondingId] = useState<number | null>(null);
    const [respondErrors, setRespondErrors] = useState<Record<number, string>>({});

    const [isLoading, startLoad] = useTransition();
    const [isResponding, startRespond] = useTransition();

    // Muat ulang daftar permintaan tukar tiap kali modal dibuka.
    useEffect(() => {
        if (!isOpen) return;

        startLoad(async () => {
            setLoadError(null);
            try {
                const data = await getMyIncomingSwapRequestsAction();
                setRequests(data);
            } catch {
                setLoadError("Gagal memuat permintaan tukar task. Coba lagi.");
            }
        });
    }, [isOpen]);

    function handleRespond(request: TaskSwapRequestListItem, status: "approved" | "rejected") {
        setRespondingId(request.id);
        setRespondErrors((prev) => {
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
            setRespondingId(null);

            if (!result.success) {
                setRespondErrors((prev) => ({
                    ...prev,
                    [request.id]: result.error ?? "Gagal merespons permintaan tukar task.",
                }));
                return;
            }

            setRequests((prev) => prev.filter((r) => r.id !== request.id));
        });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Permintaan Tukar Task">
            <div className="flex flex-col gap-1.5">
                {isLoading && (
                    <p className="py-6 text-center text-sm font-inter text-muted">Memuat permintaan...</p>
                )}

                {!isLoading && loadError && (
                    <p className="py-6 text-center text-sm font-inter text-status-blocked-text">{loadError}</p>
                )}

                {!isLoading && !loadError && requests.length === 0 && (
                    <p className="py-6 text-center text-sm font-inter text-muted">
                        Tidak ada permintaan tukar task saat ini.
                    </p>
                )}

                {!isLoading &&
                    !loadError &&
                    requests.map((request) => (
                        <SwapRequestListItem
                            key={request.id}
                            request={request}
                            isResponding={isResponding && respondingId === request.id}
                            error={respondErrors[request.id] ?? null}
                            onAccept={(r) => handleRespond(r, "approved")}
                            onReject={(r) => handleRespond(r, "rejected")}
                        />
                    ))}
            </div>
        </Modal>
    );
}