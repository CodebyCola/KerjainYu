import { getSession } from "@/lib/api/auth/session";
import { getProject } from "@/lib/api/projects/projects";
import { getProjectTasks } from "@/lib/api/tasks/tasks";
import TaskBoard from "@/components/features/tasks/TaskBoard";

type TaskBoardPageProps = {
    projectId: string;
};

export default async function TaskBoardPage(props: { params: Promise<TaskBoardPageProps> }) {
    const { projectId } = await props.params;

    // Task Board butuh tiga hal dari server: sesi user saat ini, detail
    // proyek (untuk tahu apakah user leader), dan daftar task proyek.
    // GET /project/:projectId/tasks belum ada di server (fallback dummy
    // dipakai di getProjectTasks, lihat catatan di file itu), sehingga
    // halaman ini tetap bisa didesain & dites walau backend belum siap.
    const [user, projectDetail, tasks] = await Promise.all([
        getSession(),
        getProject(projectId),
        getProjectTasks(projectId),
    ]);

    const isLeader = projectDetail?.membership.role === "leader";

    return (
        <div className="flex h-full min-h-0 flex-col">
            <h2 className="shrink-0 pb-3 text-xl font-semibold md:pb-4 md:text-2xl lg:text-3xl">
                Papan Tugas
            </h2>

            <div className="min-h-0 flex-1">
                <TaskBoard
                    tasks={tasks}
                    projectId={projectId}
                    currentUserId={user?.id ?? -1}
                    isLeader={isLeader}
                    members={projectDetail?.project.members ?? []}
                />
            </div>
        </div>
    );
}