"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { Task } from "@/types/task";
import { ProjectMember } from "@/types/project";
import { getAvailableActions, ActionDefinition } from "@/lib/api/tasks/taskStatus";
import { isTaskAssignee, resolveTaskAssigneeId } from "@/lib/api/tasks/taskAssignee";
import { cn } from "@/utils/cn";
import { transitionTaskAction } from "@/app/(main)/projects/[projectId]/task-board/actions";
import TaskActionModal from "@/components/features/task-detail/TaskActionModal";
import TaskAssignModal from "@/components/features/task-detail/TaskAssignModal";

// Sinkron dengan ACTIONS_REQUIRING_DETAIL di TaskBoardCard — di halaman
// detail sendiri, aksi ini membuka modal catatan alih-alih pindah halaman.
const ACTIONS_REQUIRING_NOTE: ActionDefinition["action"][] = [
    "submit",
    "resume",
    "requestRevision",
    "reject",
];

const ACTION_BUTTON_STYLE: Record<ActionDefinition["variant"], string> = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    default: "border border-border bg-card text-foreground hover:border-primary",
    danger: "border border-status-blocked-text bg-card text-status-blocked-text hover:bg-status-blocked-bg",
};

type TaskDetailActionsProps = {
    task: Task;
    projectId: string;
    currentUserId: number;
    isLeader: boolean;
    members: ProjectMember[];
};

export default function TaskDetailActions({ task, projectId, currentUserId, isLeader, members }: TaskDetailActionsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [activeModalAction, setActiveModalAction] = useState<ActionDefinition | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignModalKey, setAssignModalKey] = useState(0);

    const actions = getAvailableActions(task.status).filter((definition) => {
        if (definition.actor === "leader") return isLeader;
        if (definition.actor === "assignee") return isTaskAssignee(task, currentUserId);
        return true; // "member" — siapapun anggota project boleh klaim
    });
    const canAssign = isLeader && resolveTaskAssigneeId(task) === null;

    if (actions.length === 0 && !canAssign) return null;

    function handleAction(definition: ActionDefinition) {
        if (ACTIONS_REQUIRING_NOTE.includes(definition.action)) {
            setActiveModalAction(definition);
            return;
        }

        setError(null);
        startTransition(async () => {
            const result = await transitionTaskAction(projectId, task.id, definition.action);
            if (!result.success) {
                setError(result.error);
                return;
            }
            router.refresh();
        });
    }

    return (
        <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-inter text-sm font-semibold text-foreground">Aksi</h3>

            <div className="mt-3 flex flex-wrap gap-2">
                {canAssign && (
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                            setAssignModalKey((key) => key + 1);
                            setIsAssignModalOpen(true);
                        }}
                        className={cn(
                            "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-inter font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none",
                            ACTION_BUTTON_STYLE.default
                        )}
                    >
                        <UserPlus className="size-3.5" aria-hidden="true" />
                        Tugaskan ke Member
                    </button>
                )}

                {actions.map((definition) => (
                    <button
                        key={definition.action}
                        type="button"
                        disabled={isPending}
                        onClick={() => handleAction(definition)}
                        className={cn(
                            "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-inter font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none",
                            ACTION_BUTTON_STYLE[definition.variant]
                        )}
                    >
                        {isPending && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
                        {definition.label}
                    </button>
                ))}
            </div>

            {error && <p className="mt-3 text-xs font-inter text-status-blocked-text">{error}</p>}

            <TaskActionModal
                definition={activeModalAction}
                projectId={projectId}
                taskId={task.id}
                onClose={() => setActiveModalAction(null)}
            />

            <TaskAssignModal
                key={assignModalKey}
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                projectId={projectId}
                taskId={task.id}
                members={members}
            />
        </div>
    );
}