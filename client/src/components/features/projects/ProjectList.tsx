"use client";

import { useMemo, useState } from "react";
import { FolderOpen } from "lucide-react";
import { Project } from "@/types/project";
import ProjectListCard from "@/components/features/projects/ProjectListCard";
import ProjectSearchBar from "@/components/features/projects/ProjectSearchBar";
import ProjectFilterBar from "@/components/features/projects/ProjectFilterBar";
import { DEFAULT_PROJECT_FILTERS, ProjectFilters, matchesFilters } from "@/app/(main)/projects/filters";

type ProjectListProps = {
    projects: Project[];
};

export default function ProjectList({ projects }: ProjectListProps) {
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_PROJECT_FILTERS);

    const filteredProjects = useMemo(() => {
        const query = search.trim().toLowerCase();
        return projects.filter((project) => {
            const matchesSearch = !query || project.title.toLowerCase().includes(query);
            return matchesSearch && matchesFilters(project, filters);
        });
    }, [projects, search, filters]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 md:items-start md:gap-4 lg:items-end lg:justify-between">
                <div className="min-w-0 flex-1 lg:max-w-lg">
                    <ProjectSearchBar value={search} onChange={setSearch} />
                </div>
                <ProjectFilterBar filters={filters} onChange={setFilters} />
            </div>

            {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                    <FolderOpen className="size-8 text-muted" />
                    <p className="font-inter text-sm text-muted">
                        {search || filters.status !== "all" || filters.deadline !== "all"
                            ? "Proyek tidak ditemukan"
                            : "Belum ada proyek"}
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