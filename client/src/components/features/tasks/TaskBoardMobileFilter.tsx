"use client";

import { useMemo, useState } from "react";
import { Task, TaskStatus } from "@/types/task";
import { ProjectMember } from "@/types/project";
import TaskBoardStatusFilter from "@/components/features/tasks/TaskBoardStatusFilter";
import TaskBoardCard from "@/components/features/tasks/TaskBoardCard";
import { BOARD_COLUMNS, getColumnForStatus, BoardColumnId } from "@/lib/api/tasks/taskStatus";

type TaskBoardMobileFilterProps = {
    tasks: Task[];
    projectId: string;
    currentUserId: number;
    isLeader: boolean;
    members: ProjectMember[];
};

const FILTER_OPTIONS = BOARD_COLUMNS.map((column) => ({ value: column.id, label: column.label }));

export default function TaskBoardMobileFilter({
    tasks,
    projectId,
    currentUserId,
    isLeader,
    members,
}: TaskBoardMobileFilterProps) {
    const [selectedColumn, setSelectedColumn] = useState<BoardColumnId>("todo");
    const [overrides, setOverrides] = useState<Record<number, TaskStatus>>({});

    const effectiveTasks = useMemo(
        () => tasks.map((task) => (overrides[task.id] ? { ...task, status: overrides[task.id] } : task)),
        [tasks, overrides]
    );

    const filteredTasks = useMemo(
        () => effectiveTasks.filter((task) => getColumnForStatus(task.status) === selectedColumn),
        [effectiveTasks, selectedColumn]
    );

    function handleOptimisticAction(taskId: number, nextStatus: TaskStatus) {
        setOverrides((prev) => ({ ...prev, [taskId]: nextStatus }));
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            {/* Filter status — pengganti kolom kanban di layar sempit */}
            <div className="mb-3 flex shrink-0 items-center gap-2">
                <TaskBoardStatusFilter
                    options={FILTER_OPTIONS}
                    value={selectedColumn}
                    onChange={setSelectedColumn}
                />
            </div>

            {/* Isi list — satu-satunya bagian yang scroll vertikal */}
            <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto">
                {filteredTasks.length === 0 ? (
                    <p className="px-2 py-10 text-center text-sm font-inter text-muted">
                        Tidak ada tugas dengan status ini
                    </p>
                ) : (
                    filteredTasks.map((task) => (
                        <TaskBoardCard
                            key={task.id}
                            task={task}
                            projectId={projectId}
                            currentUserId={currentUserId}
                            isLeader={isLeader}
                            members={members}
                            onOptimisticAction={handleOptimisticAction}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
