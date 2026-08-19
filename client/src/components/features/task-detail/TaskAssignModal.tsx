"use client";

import { useState, useTransition } from "react";
import { Loader2, User } from "lucide-react";
import Modal from "@/components/ui/Modal";
import AuthErrorBanner from "@/components/features/auth/AuthErrorBanner";
import { ProjectMember } from "@/types/project";
import { assignTaskAction } from "@/app/(main)/projects/[projectId]/task-board/actions";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/getInitials";

type TaskAssignModalProps = {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    taskId: number;
    members: ProjectMember[];
};

export default function TaskAssignModal({ isOpen, onClose, projectId, taskId, members }: TaskAssignModalProps) {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSubmit() {
        if (selectedUserId === null) {
            setError("Pilih salah satu member terlebih dahulu.");
            return;
        }

        setError(null);
        startTransition(async () => {
            const result = await assignTaskAction(projectId, taskId, selectedUserId);
            if (!result.success) {
                setError(result.error);
                return;
            }
            onClose();
        });
    }

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tugaskan ke Member">
            <div className="flex flex-col gap-4">
                <AuthErrorBanner message={error} />

                {members.length === 0 ? (
                    <p className="text-sm font-inter text-muted">Belum ada member di project ini.</p>
                ) : (
                    <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
                        {members.map((member) => {
                            const isSelected = selectedUserId === member.userId;
                            return (
                                <button
                                    key={member.userId}
                                    type="button"
                                    onClick={() => setSelectedUserId(member.userId)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                                        isSelected
                                            ? "border-primary bg-status-todo-bg"
                                            : "border-border bg-card hover:border-primary/50"
                                    )}
                                >
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-role-member-bg text-[11px] font-inter font-semibold text-role-member-text">
                                        {member.avatarUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={member.avatarUrl}
                                                alt={member.username}
                                                className="size-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            getInitials(member.username)
                                        )}
                                    </div>
                                    <div className="flex min-w-0 flex-col">
                                        <span className="truncate text-sm font-inter font-medium text-foreground">
                                            {member.username}
                                        </span>
                                        <span className="text-xs font-inter text-muted">
                                            {member.role === "leader" ? "Leader" : "Member"}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <User className="ml-auto size-4 shrink-0 text-primary" aria-hidden="true" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-inter font-medium text-foreground transition-colors hover:bg-status-todo-bg sm:min-h-10"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        disabled={isPending || members.length === 0}
                        onClick={handleSubmit}
                        aria-busy={isPending}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10"
                    >
                        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                        {isPending ? "Menugaskan..." : "Tugaskan"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}