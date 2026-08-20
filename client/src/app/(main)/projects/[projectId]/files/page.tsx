import { notFound } from "next/navigation";
import { getProject } from "@/lib/api/projects/projects";
import FilesPageContent from "@/components/features/files/FilesPageContent";

type FilesPageProps = {
    params: Promise<{ projectId: string }>;
};

export default async function FilesPage({ params }: FilesPageProps) {
    const { projectId } = await params;
    const detail = await getProject(projectId);

    if (!detail) {
        notFound();
    }

    const canManage = detail.membership.role === "leader";

    return (
        <FilesPageContent
            projectId={projectId}
            projectTitle={detail.project.title}
            initialLinks={detail.links}
            canManage={canManage}
        />
    );
}