import { notFound } from "next/navigation";
import { getProject } from "@/lib/api/projects/projects";

type ProjectOverviewPageProps = {
    params: Promise<{ projectId: string }>;
};

export default async function ProjectOverviewPage({ params }: ProjectOverviewPageProps) {
    const { projectId } = await params;
    const detail = await getProject(projectId);
    if (!detail) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">{detail.project.title}</h2>
            <p className="text-sm font-inter text-muted">
                Halaman overview proyek, gunakan navigasi di atas untuk membuka TIm, Papan Tugas, Kalender, atau Berkas.
            </p>
        </div>
    );
}
