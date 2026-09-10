"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Task, TaskStatus } from "@/types/task";
import { ProjectMember } from "@/types/project";
import { BOARD_COLUMNS, getColumnForStatus } from "@/lib/api/tasks/taskStatus";
import TaskBoardColumn from "@/components/features/tasks/TaskBoardColumn";

type TaskBoardKanbanProps = {
    tasks: Task[];
    projectId: string;
    currentUserId: number;
    isLeader: boolean;
    members: ProjectMember[];
};

export default function TaskBoardKanban({
    tasks,
    projectId,
    currentUserId,
    isLeader,
    members,
}: TaskBoardKanbanProps) {
    const [overrides, setOverrides] = useState<Record<number, TaskStatus>>({});
    const tasksRef = useRef(tasks);
    useEffect(() => {
        if (tasksRef.current !== tasks) {
            tasksRef.current = tasks;
            setOverrides({});
        }
    }, [tasks]);

    const effectiveTasks = useMemo(
        () => tasks.map((task) => (overrides[task.id] ? { ...task, status: overrides[task.id] } : task)),
        [tasks, overrides]
    );

    const tasksByColumn = useMemo(() => {
        const grouped = new Map<string, Task[]>(BOARD_COLUMNS.map((col) => [col.id, []]));
        for (const task of effectiveTasks) {
            const columnId = getColumnForStatus(task.status);
            grouped.get(columnId)?.push(task);
        }
        return grouped;
    }, [effectiveTasks]);

    function handleOptimisticAction(taskId: number, nextStatus: TaskStatus) {
        setOverrides((prev) => ({ ...prev, [taskId]: nextStatus }));
    }

    return (
        <div className="flex h-full min-h-0 gap-4 overflow-x-auto pb-2">
            {BOARD_COLUMNS.map((column) => (
                <TaskBoardColumn
                    key={column.id}
                    column={column}
                    tasks={tasksByColumn.get(column.id) ?? []}
                    projectId={projectId}
                    currentUserId={currentUserId}
                    isLeader={isLeader}
                    members={members}
                    onOptimisticAction={handleOptimisticAction}
                />
            ))}
        </div>
    );
}
