import { notFound } from "next/navigation";
import { getProject } from "@/lib/api/projects/projects";

type FilesPageProps = {
    params: Promise<{ projectId: string }>;
};

export default async function FilesPage({ params }: FilesPageProps) {
    const { projectId } = await params;
    const detail = await getProject(projectId);

    if (!detail) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">Files</h2>
            <p className="text-sm font-inter text-muted">{detail.project.title} — halaman ini belum diimplementasikan.</p>
        </div>
    );
}
