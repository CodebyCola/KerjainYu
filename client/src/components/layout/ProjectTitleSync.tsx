"use client";

import { useEffect } from "react";
import { useProjectTitle } from "@/contexts/ProjectTitleContext";

type ProjectTitleSyncProps = {
    title: string;
};

// Cuma sinkron data yang sudah didapat lewat server render ke context,
// bukan fetch baru. Dipasang di [projectId]/layout.tsx.
export default function ProjectTitleSync({ title }: ProjectTitleSyncProps) {
    const { setTitle } = useProjectTitle();

    useEffect(() => {
        setTitle(title);
        return () => setTitle(null);
    }, [title, setTitle]);

    return null;
}
