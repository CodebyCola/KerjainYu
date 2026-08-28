import { getSession } from "@/lib/api/auth/session";
import { getProject } from "@/lib/api/projects/projects";
import { getProjectMembers } from "@/lib/api/members/members";
import { getProjectTasks } from "@/lib/api/tasks/tasks";
import { getPendingSubmissions } from "@/lib/api/submissions/submissions";
import TaskBoard from "@/components/features/tasks/TaskBoard";
import CreateTaskButton from "@/components/features/tasks/CreateTaskButton";
import PendingSubmissionsLink from "@/components/features/tasks/PendingSubmissionsLink";

type TaskBoardPageProps = {
    projectId: string;
};

export default async function TaskBoardPage(props: { params: Promise<TaskBoardPageProps> }) {
    const { projectId } = await props.params;

    const [user, projectDetail, tasks, members] = await Promise.all([
        getSession(),
        getProject(projectId),
        getProjectTasks(projectId),
        getProjectMembers(projectId),
    ]);

    const isLeader = projectDetail?.membership.role === "leader";
    const pendingSubmissions = isLeader ? await getPendingSubmissions(projectId) : [];

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 pb-3 md:pb-4">
                <h2 className="text-xl font-semibold md:text-2xl lg:text-3xl">
                    Papan Tugas
                </h2>
                <div className="flex items-center gap-2.5">
                    {isLeader && (
                        <PendingSubmissionsLink projectId={projectId} count={pendingSubmissions.length} />
                    )}
                    {isLeader && <CreateTaskButton projectId={projectId} />}
                </div>
            </div>

            <div className="min-h-0 flex-1">
                <TaskBoard
                    tasks={tasks}
                    projectId={projectId}
                    currentUserId={user?.id ?? -1}
                    isLeader={isLeader}
                    members={members}
                />
            </div>
        </div>
    );
}