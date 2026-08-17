import { notFound } from "next/navigation";
import { getProject } from "@/lib/api/projects/projects";
import ProjectTitleSync from "@/components/layout/ProjectTitleSync";

type ProjectLayoutProps = {
    params: Promise<{ projectId: string }>;
    children: React.ReactNode;
};

export default async function ProjectLayout({ params, children }: ProjectLayoutProps) {
    const { projectId } = await params;

    const detail = await getProject(projectId);

    if (!detail) {
        notFound();
    }

    return (
        <>
            <ProjectTitleSync title={detail.project.title} />
            {children}
        </>
    );
}
