import { notFound } from "next/navigation";
import { getSession } from "@/lib/api/auth/session";
import { getProject } from "@/lib/api/projects/projects";
import { getProjectMembers } from "@/lib/api/members/members";
import { getProjectTasks, getTaskDetailData, getTaskComments } from "@/lib/api/tasks/tasks";
import { findTaskAssignee } from "@/lib/api/tasks/taskAssignee";
import TaskDetailHeader from "@/components/features/task-detail/TaskDetailHeader";
import TaskDetailInfo from "@/components/features/task-detail/TaskDetailInfo";
import TaskDetailActions from "@/components/features/task-detail/TaskDetailActions";
import TaskSubmissionPanel from "@/components/features/task-detail/TaskSubmissionPanel";
import TaskComments from "@/components/features/task-detail/TaskComments";

type TaskDetailPageProps = {
    projectId: string;
    id: string;
};

export default async function TaskDetailPage(props: { params: Promise<TaskDetailPageProps> }) {
    const { projectId, id } = await props.params;
    const taskId = Number(id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
        notFound();
    }

    const [user, projectDetail, members, task, comments, projectTasks] = await Promise.all([
        getSession(),
        getProject(projectId),
        getProjectMembers(projectId),
        getTaskDetailData(taskId),
        getTaskComments(taskId),
        getProjectTasks(projectId),
    ]);
    
    if (!projectDetail || !task || String(task.projectId) !== String(projectId)) {
        notFound();
    }

    const isLeader = projectDetail.membership.role === "leader";
    const assignee = findTaskAssignee(task, members);

    return (
        <div className="flex flex-col gap-4 pb-6">
            <TaskDetailHeader task={task} projectId={projectId} projectTitle={projectDetail.project.title} />

            <TaskDetailInfo task={task} assignee={assignee} />

            <TaskDetailActions
                task={task}
                projectId={projectId}
                currentUserId={user?.id ?? -1}
                isLeader={isLeader}
                members={members}
                project={projectDetail.project}
                projectTasks={projectTasks}
            />

            {task.latestSubmission && <TaskSubmissionPanel submission={task.latestSubmission} />}

            <TaskComments comments={comments} projectId={projectId} taskId={taskId} />
        </div>
    );
}