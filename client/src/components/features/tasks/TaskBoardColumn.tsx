import { Task } from "@/types/task";
import { ProjectMember } from "@/types/project";
import { BoardColumn } from "@/lib//api/tasks/taskStatus";
import TaskBoardCard from "@/components/features/tasks/TaskBoardCard";

type TaskBoardColumnProps = {
    column: BoardColumn;
    tasks: Task[];
    projectId: string;
    currentUserId: number;
    isLeader: boolean;
    members: ProjectMember[];
    onOptimisticAction?: (taskId: number, nextStatus: Task["status"]) => void;
};

export default function TaskBoardColumn({
    column,
    tasks,
    projectId,
    currentUserId,
    isLeader,
    members,
    onOptimisticAction,
}: TaskBoardColumnProps) {
    return (
        <div className="flex h-full w-72 shrink-0 flex-col sm:w-80">
            {/* Header kolom — tetap diam, tidak ikut scroll bareng isi kolom */}
            <div className="mb-3 flex shrink-0 items-center gap-2 px-0.5">
                <h3 className="font-inter text-sm font-semibold text-foreground">{column.label}</h3>
                <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[11px] font-inter font-medium text-muted">
                    {tasks.length}
                </span>
            </div>

            {/* Isi kolom — satu-satunya bagian yang scroll vertikal */}
            <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto rounded-lg bg-secondary p-2">
                {tasks.length === 0 ? (
                    <p className="px-2 py-6 text-center text-xs font-inter text-muted">
                        Belum ada tugas
                    </p>
                ) : (
                    tasks.map((task) => (
                        <TaskBoardCard
                            key={task.id}
                            task={task}
                            projectId={projectId}
                            currentUserId={currentUserId}
                            isLeader={isLeader}
                            members={members}
                            onOptimisticAction={onOptimisticAction}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
