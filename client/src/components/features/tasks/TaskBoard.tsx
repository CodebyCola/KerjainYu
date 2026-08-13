import { Task } from "@/types/task";
import { ProjectMember } from "@/types/project";
import TaskBoardKanban from "@/components/features/tasks/TaskBoardKanban";
import TaskBoardMobileFilter from "@/components/features/tasks/TaskBoardMobileFilter";

type TaskBoardProps = {
    tasks: Task[];
    projectId: string;
    currentUserId: number;
    isLeader: boolean;
    members: ProjectMember[];
};

export default function TaskBoard({ tasks, projectId, currentUserId, isLeader, members }: TaskBoardProps) {
    return (
        <div className="h-full min-h-0">
            {/* Mobile: < md — filter status, bukan kanban (kolom terlalu sempit di layar kecil) */}
            <div className="h-full min-h-0 md:hidden">
                <TaskBoardMobileFilter
                    tasks={tasks}
                    projectId={projectId}
                    currentUserId={currentUserId}
                    isLeader={isLeader}
                    members={members}
                />
            </div>

            {/* Tablet & desktop: >= md — kanban penuh, kelebihan kolom di-scroll horizontal */}
            <div className="hidden h-full min-h-0 md:block">
                <TaskBoardKanban
                    tasks={tasks}
                    projectId={projectId}
                    currentUserId={currentUserId}
                    isLeader={isLeader}
                    members={members}
                />
            </div>
        </div>
    );
}
