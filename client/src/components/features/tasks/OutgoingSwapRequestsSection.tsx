"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowLeftRight, ChevronDown, Loader2 } from "lucide-react";
import { TaskSwapRequestListItem } from "@/types/task";
import { getMyOutgoingSwapRequestsAction, cancelSwapRequestAction } from "@/app/(main)/my-tasks/actions";
import OutgoingSwapRequestItem from "@/components/features/tasks/OutgoingSwapRequestItem";
import { cn } from "@/utils/cn";

export default function OutgoingSwapRequestsSection() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [requests, setRequests] = useState<TaskSwapRequestListItem[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const [cancelErrors, setCancelErrors] = useState<Record<number, string>>({});

    const [isLoading, startLoad] = useTransition();
    const [isCancelling, startCancel] = useTransition();

    const pendingCount = requests.filter((r) => r.status === "pending").length;

    useEffect(() => {
        if (!isOpen || hasLoaded) return;

        startLoad(async () => {
            setLoadError(null);
            try {
                const data = await getMyOutgoingSwapRequestsAction();
                setRequests(data);
                setHasLoaded(true);
            } catch {
                setLoadError("Gagal memuat permintaan tukar task. Coba lagi.");
            }
        });
    }, [isOpen, hasLoaded]);

    function handleCancel(request: TaskSwapRequestListItem) {
        setCancellingId(request.id);
        setCancelErrors((prev) => {
            const next = { ...prev };
            delete next[request.id];
            return next;
        });

        startCancel(async () => {
            const result = await cancelSwapRequestAction(request.id);
            setCancellingId(null);

            if (!result.success) {
                setCancelErrors((prev) => ({
                    ...prev,
                    [request.id]: result.error ?? "Gagal membatalkan permintaan.",
                }));
                return;
            }

            setRequests((prev) => prev.filter((r) => r.id !== request.id));
        });
    }

    return (
        <div className="rounded-xl border border-border bg-card">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 p-4 text-left sm:p-4"
            >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-status-progress-bg text-status-progress-text">
                    <ArrowLeftRight className="size-4" aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="font-inter text-sm font-semibold text-foreground sm:text-base">
                        Permintaan Tukar Task yang Saya Ajukan
                    </p>
                    <p className="text-xs font-inter text-muted sm:text-sm">
                        {hasLoaded
                            ? pendingCount > 0
                                ? `${pendingCount} masih menunggu respons`
                                : "Tidak ada yang menunggu respons"
                            : "Lihat status pengajuan tukar task kamu"}
                    </p>
                </div>

                <ChevronDown
                    className={cn(
                        "size-5 shrink-0 text-muted transition-transform",
                        isOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <div className="border-t border-border p-3 sm:p-4">
                    {isLoading && (
                        <p className="flex items-center justify-center gap-2 py-6 text-center font-inter text-sm text-muted">
                            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                            Memuat...
                        </p>
                    )}

                    {!isLoading && loadError && (
                        <p className="py-6 text-center font-inter text-sm text-status-blocked-text">
                            {loadError}
                        </p>
                    )}

                    {!isLoading && !loadError && requests.length === 0 && (
                        <p className="py-6 text-center font-inter text-sm text-muted">
                            Kamu belum pernah mengajukan tukar task.
                        </p>
                    )}

                    {!isLoading && !loadError && requests.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {requests.map((request) => (
                                <OutgoingSwapRequestItem
                                    key={request.id}
                                    request={request}
                                    isCancelling={isCancelling && cancellingId === request.id}
                                    error={cancelErrors[request.id] ?? null}
                                    onCancel={handleCancel}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}