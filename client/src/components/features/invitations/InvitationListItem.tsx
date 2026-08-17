"use client";

import { Check, X, Loader2 } from "lucide-react";
import { getInitials } from "@/utils/getInitials";
import { Invitation } from "@/types/team";

type InvitationListItemProps = {
    invitation: Invitation;
    isResponding: boolean;
    error: string | null;
    onAccept: (invitation: Invitation) => void;
    onReject: (invitation: Invitation) => void;
};

export default function InvitationListItem({
    invitation,
    isResponding,
    error,
    onAccept,
    onReject,
}: InvitationListItemProps) {
    return (
        <div className="flex flex-col gap-1 rounded-lg border border-border p-2.5">
            <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-role-guest-bg text-xs font-inter font-semibold text-role-guest-text">
                    {getInitials(invitation.projectTitle)}
                </div>
                <p className="min-w-0 flex-1 truncate font-inter text-sm font-medium text-foreground">
                    {invitation.projectTitle}
                </p>

                {isResponding ? (
                    <Loader2 className="size-4 shrink-0 animate-spin text-muted" aria-hidden="true" />
                ) : (
                    <div className="flex shrink-0 items-center gap-1.5">
                        <button
                            type="button"
                            aria-label={`Tolak undangan ${invitation.projectTitle}`}
                            onClick={() => onReject(invitation)}
                            className="flex size-8 items-center justify-center rounded-lg text-status-blocked-text transition-colors hover:bg-status-blocked-bg"
                        >
                            <X className="size-4" />
                        </button>
                        <button
                            type="button"
                            aria-label={`Terima undangan ${invitation.projectTitle}`}
                            onClick={() => onAccept(invitation)}
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
