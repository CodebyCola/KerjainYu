import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProject } from "@/lib/api/projects/projects";
import { getPendingSubmissions } from "@/lib/api/submissions/submissions";
import { projectRoutes } from "@/lib/routes";
import PendingSubmissionList from "@/components/features/task-detail/PendingSubmissionList";

type PendingSubmissionsPageProps = {
    projectId: string;
};

// GET /projects/:id/pending-submissions — daftar submission yang menunggu
// review leader di project ini, supaya leader tidak perlu buka satu-satu
// task untuk mengecek submission yang masuk.
export default async function PendingSubmissionsPage(props: { params: Promise<PendingSubmissionsPageProps> }) {
    const { projectId } = await props.params;

    const projectDetail = await getProject(projectId);
    if (!projectDetail) {
        notFound();
    }

    const isLeader = projectDetail.membership.role === "leader";
    if (!isLeader) {
        notFound();
    }

    const submissions = await getPendingSubmissions(projectId);

    return (
        <div className="flex flex-col gap-4 pb-6">
            <div className="flex flex-col gap-3">
                <Link
                    href={projectRoutes(projectId).TASK_BOARD}
                    className="flex w-fit items-center gap-1.5 text-sm font-inter text-muted transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    Kembali ke papan tugas
                </Link>

                <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-inter text-muted">{projectDetail.project.title}</p>
                    <h1 className="font-inter text-xl font-semibold text-foreground md:text-2xl">
                        Submission Menunggu Review
                    </h1>
                </div>
            </div>

            <PendingSubmissionList submissions={submissions} projectId={projectId} />
        </div>
    );
}
