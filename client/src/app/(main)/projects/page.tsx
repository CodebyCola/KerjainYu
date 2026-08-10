import ProjectList from "@/components/features/projects/ProjectList";
import CreateProjectButton from "@/components/features/projects/CreateProjectButton";
import { getProjects } from "@/lib/api/projects/projects";

export default async function Projects() {
    const projects = await getProjects();

    return (
        <>
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">Daftar Proyek</h2>
                <CreateProjectButton />
            </div>
            <div className="mt-4">
                <ProjectList projects={projects} />
            </div>
        </>
    );
}