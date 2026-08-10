import ProjectList from "@/components/features/projects/ProjectList";
import CreateProjectButton from "@/components/features/projects/CreateProjectButton";
import { getProjects } from "@/lib/api/projects/projects";
import { mergeWithDummy } from "./dataDummy";

export default async function Projects() {
    // kalau gak mau pakai dummy tinggal hapus aja projects dan ganti realProjects jadi projects
    const realProjects = await getProjects();
    const projects = mergeWithDummy(realProjects);

    return (
        <>
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">Your Projects</h2>
                <CreateProjectButton />
            </div>
            <div className="mt-4">
                <ProjectList projects={projects} />
            </div>
        </>
    );
}