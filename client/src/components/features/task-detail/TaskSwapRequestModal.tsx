"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowLeftRight, Check, ChevronRight, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import AuthErrorBanner from "@/components/features/auth/AuthErrorBanner";
import { ProjectMember } from "@/types/project";
import { Task } from "@/types/task";
import { createSwapRequestAction } from "@/app/(main)/projects/[projectId]/task-board/actions";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/getInitials";
import { resolveTaskAssigneeId } from "@/lib/api/tasks/taskAssignee";

type TaskSwapRequestModalProps = {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    task: Task;
    currentUserId: number;
    members: ProjectMember[];
    // Semua task di project ini — dipakai untuk menawarkan pilihan "tukar
    // dengan task milik dia" di langkah kedua (opsional, two-way swap).
    projectTasks: Task[];
};

type Step = "pick-member" | "pick-task";

const SWAPPABLE_STATUSES: Task["status"][] = ["todo", "ongoing"];

export default function TaskSwapRequestModal({
    isOpen,
    onClose,
    projectId,
    task,
    currentUserId,
    members,
    projectTasks,
}: TaskSwapRequestModalProps) {
    const [step, setStep] = useState<Step>("pick-member");
    const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
    const [selectedTargetTaskId, setSelectedTargetTaskId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Anggota lain yang bisa diajak tukar — exclude diri sendiri.
    const eligibleMembers = useMemo(
        () => members.filter((member) => member.userId !== currentUserId),
        [members, currentUserId]
    );

    // Task milik member yang dipilih, yang statusnya masih bisa ditukar.
    const targetMemberTasks = useMemo(() => {
        if (!selectedMember) return [];
        return projectTasks.filter((candidate) => {
            if (candidate.id === task.id) return false;
            const assigneeId = resolveTaskAssigneeId(candidate);
            if (assigneeId !== String(selectedMember.userId)) return false;
            return SWAPPABLE_STATUSES.includes(candidate.status);
        });
    }, [projectTasks, selectedMember, task.id]);

    function resetAndClose() {
        setStep("pick-member");
        setSelectedMember(null);
        setSelectedTargetTaskId(null);
        setError(null);
        onClose();
    }

    function handleSelectMember(member: ProjectMember) {
        setSelectedMember(member);
        setSelectedTargetTaskId(null);
        setError(null);
    }

    function handleContinueToTaskStep() {
        if (!selectedMember) {
            setError("Pilih member yang ingin diajak tukar terlebih dahulu.");
            return;
        }
        setError(null);
        setStep("pick-task");
    }

    function handleSubmit(oneWay: boolean) {
        if (!selectedMember) {
            setError("Pilih member yang ingin diajak tukar terlebih dahulu.");
            return;
        }

        setError(null);
        startTransition(async () => {
            const result = await createSwapRequestAction(projectId, task.id, {
                requestedTo: selectedMember.userId,
                targetTaskId: oneWay ? undefined : selectedTargetTaskId ?? undefined,
            });

            if (!result.success) {
                setError(result.error);
                return;
            }
            resetAndClose();
        });
    }

    if (!isOpen) return null;

    const title = step === "pick-member" ? "Ajukan Tukar Task" : "Pilih Task Penukar";

    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} title={title}>
            <div className="flex flex-col gap-4">
                <AuthErrorBanner message={error} />

                {step === "pick-member" && (
                    <>
                        <div className="rounded-lg bg-status-todo-bg px-3 py-2.5">
                            <p className="text-xs font-inter text-muted">Task yang ditawarkan</p>
                            <p className="truncate text-sm font-inter font-medium text-foreground">{task.title}</p>
                        </div>

                        <p className="text-sm font-inter text-muted">
                            Pilih anggota project yang ingin kamu ajak tukar task ini. Dia akan menerima
                            notifikasi untuk menyetujui atau menolak.
                        </p>

                        {eligibleMembers.length === 0 ? (
                            <p className="py-6 text-center text-sm font-inter text-muted">
                                Belum ada anggota lain di project ini untuk diajak tukar.
                            </p>
                        ) : (
                            <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
                                {eligibleMembers.map((member) => {
                                    const isSelected = selectedMember?.userId === member.userId;
                                    return (
                                        <button
                                            key={member.userId}
                                            type="button"
                                            onClick={() => handleSelectMember(member)}
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
                                                        alt={member.fullName ?? member.username}
                                                        className="size-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    getInitials(member.fullName ?? member.username)
                                                )}
                                            </div>
                                            <div className="flex min-w-0 flex-col">
                                                <span className="truncate text-sm font-inter font-medium text-foreground">
                                                    {member.fullName ?? member.username}
                                                </span>
                                                <span className="truncate text-xs font-inter text-muted">
                                                    @{member.username} · {member.role === "leader" ? "Leader" : "Member"}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <Check className="ml-auto size-4 shrink-0 text-primary" aria-hidden="true" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={resetAndClose}
                                className="flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-inter font-medium text-foreground transition-colors hover:bg-status-todo-bg sm:min-h-10"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={!selectedMember || eligibleMembers.length === 0}
                                onClick={handleContinueToTaskStep}
                                className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10"
                            >
                                Lanjut
                                <ChevronRight className="size-4" aria-hidden="true" />
                            </button>
                        </div>
                    </>
                )}

                {step === "pick-task" && selectedMember && (
                    <>
                        <button
                            type="button"
                            onClick={() => setStep("pick-member")}
                            className="flex w-fit items-center gap-1 text-xs font-inter font-medium text-muted transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-3.5" aria-hidden="true" />
                            Ganti anggota
                        </button>

                        <p className="text-sm font-inter text-muted">
                            Opsional: tukar langsung dengan salah satu task milik{" "}
                            <span className="font-medium text-foreground">
                                {selectedMember.fullName ?? selectedMember.username}
                            </span>
                            . Kalau tidak dipilih, task kamu akan ditawarkan begitu saja untuk diambil alih.
                        </p>

                        <div className="flex flex-col gap-1.5">
                            <button
                                type="button"
                                onClick={() => setSelectedTargetTaskId(null)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                                    selectedTargetTaskId === null
                                        ? "border-primary bg-status-todo-bg"
                                        : "border-border bg-card hover:border-primary/50"
                                )}
                            >
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-status-todo-bg">
                                    <ArrowLeftRight className="size-4 text-muted" aria-hidden="true" />
                                </div>
                                <div className="flex min-w-0 flex-col">
                                    <span className="text-sm font-inter font-medium text-foreground">
                                        Tanpa task penukar
                                    </span>
                                    <span className="text-xs font-inter text-muted">Swap satu arah</span>
                                </div>
                                {selectedTargetTaskId === null && (
                                    <Check className="ml-auto size-4 shrink-0 text-primary" aria-hidden="true" />
                                )}
                            </button>

                            {targetMemberTasks.length === 0 ? (
                                <p className="px-1 py-2 text-xs font-inter text-muted">
                                    {selectedMember.fullName ?? selectedMember.username} belum punya task lain yang bisa ditukar saat ini.
                                </p>
                            ) : (
                                <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
                                    {targetMemberTasks.map((candidate) => {
                                        const isSelected = selectedTargetTaskId === candidate.id;
                                        return (
                                            <button
                                                key={candidate.id}
                                                type="button"
                                                onClick={() => setSelectedTargetTaskId(candidate.id)}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                                                    isSelected
                                                        ? "border-primary bg-status-todo-bg"
                                                        : "border-border bg-card hover:border-primary/50"
                                                )}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-inter font-medium text-foreground">
                                                        {candidate.title}
                                                    </p>
                                                    <p className="text-xs font-inter text-muted">
                                                        {candidate.status === "todo" ? "Todo" : "Ongoing"}
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={resetAndClose}
                                className="flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-inter font-medium text-foreground transition-colors hover:bg-status-todo-bg sm:min-h-10"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                aria-busy={isPending}
                                onClick={() => handleSubmit(selectedTargetTaskId === null)}
                                className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-inter font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10"
                            >
                                {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                                {isPending ? "Mengirim..." : "Kirim Permintaan"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
