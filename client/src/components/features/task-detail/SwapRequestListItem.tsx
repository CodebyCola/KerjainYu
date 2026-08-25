"use client";

import { Check, X, Loader2, ArrowLeftRight } from "lucide-react";
import { TaskSwapRequestListItem } from "@/types/task";

type SwapRequestListItemProps = {
    request: TaskSwapRequestListItem;
    isResponding: boolean;
    error: string | null;
    onAccept: (request: TaskSwapRequestListItem) => void;
    onReject: (request: TaskSwapRequestListItem) => void;
};

export default function SwapRequestListItem({
    request,
    isResponding,
    error,
    onAccept,
    onReject,
}: SwapRequestListItemProps) {
    return (
        <div className="flex flex-col gap-1 rounded-lg border border-border p-2.5">
            <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-status-progress-bg text-status-progress-text">
                    <ArrowLeftRight className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate font-inter text-sm font-medium text-foreground">
                        {request.requestedBy.username} ingin menukar
                    </p>
                    <p className="truncate font-inter text-xs text-muted">
                        {request.task.title}
                        {request.targetTask ? ` ↔ ${request.targetTask.title}` : ""}
                    </p>
                </div>

                {isResponding ? (
                    <Loader2 className="size-4 shrink-0 animate-spin text-muted" aria-hidden="true" />
                ) : (
                    <div className="flex shrink-0 items-center gap-1.5">
                        <button
                            type="button"
                            aria-label={`Tolak tukar task dari ${request.requestedBy.username}`}
                            onClick={() => onReject(request)}
                            className="flex size-8 items-center justify-center rounded-lg text-status-blocked-text transition-colors hover:bg-status-blocked-bg"
                        >
                            <X className="size-4" />
                        </button>
                        <button
                            type="button"
                            aria-label={`Terima tukar task dari ${request.requestedBy.username}`}
                            onClick={() => onAccept(request)}
                            className="flex size-8 items-center justify-center rounded-lg text-status-done-text transition-colors hover:bg-status-done-bg"
                        >
                            <Check className="size-4" />
                        </button>
                    </div>
                )}
            </div>
            {error && (
                <p className="pl-12 text-xs font-inter text-status-blocked-text">{error}</p>
            )}
        </div>
    );
}