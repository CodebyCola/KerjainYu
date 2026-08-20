"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";
import { ProjectLink } from "@/types/project";
import AddLinkButton from "@/components/features/files/AddLinkButton";
import LinkList from "@/components/features/files/LinkList";

type FilesPageContentProps = {
    projectId: string;
    projectTitle: string;
    initialLinks: ProjectLink[];
    canManage: boolean;
};

export default function FilesPageContent({ projectId, projectTitle, initialLinks, canManage }: FilesPageContentProps) {
    const [links, setLinks] = useState(initialLinks);

    function handleAdded(link: ProjectLink) {
        setLinks((prev) => [link, ...prev]);
    }

    function handleRemoved(linkId: number) {
        setLinks((prev) => prev.filter((l) => l.id !== linkId));
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 font-inter text-xl font-semibold text-foreground md:text-2xl">
                        <FolderOpen className="size-5 text-muted" />
                        Berkas
                    </h2>
                    <p className="mt-1 text-sm font-inter text-muted">
                        {projectTitle} · {links.length} berkas
                    </p>
                </div>

                {canManage && <AddLinkButton projectId={projectId} onAdded={handleAdded} />}
            </div>

            <LinkList projectId={projectId} links={links} canManage={canManage} onRemoved={handleRemoved} />
        </div>
    );
}