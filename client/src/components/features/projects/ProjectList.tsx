"use client";

import { useMemo, useState } from "react";
import { FolderOpen } from "lucide-react";
import { Project } from "@/types/project";
import ProjectListCard from "@/components/features/projects/ProjectListCard";
import ProjectSearchBar from "@/components/features/projects/ProjectSearchBar";

type ProjectListProps = {
    projects: Project[];
};

export default function ProjectList({ projects }: ProjectListProps) {
    const [search, setSearch] = useState("");

    const filteredProjects = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return projects;
        return projects.filter((project) => project.title.toLowerCase().includes(query));
    }, [projects, search]);

    return (
        <div className="flex flex-col gap-4">
            <ProjectSearchBar value={search} onChange={setSearch} />

            {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                    <FolderOpen className="size-8 text-muted" />
                    <p className="font-inter text-sm text-muted">
                        {search ? "Proyek tidak ditemukan" : "Belum ada proyek"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <ProjectListCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    );
}