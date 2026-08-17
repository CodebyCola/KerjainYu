"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ProjectTitleContextValue = {
    title: string | null;
    setTitle: (title: string | null) => void;
};

const ProjectTitleContext = createContext<ProjectTitleContextValue | undefined>(undefined);

export function ProjectTitleProvider({ children }: { children: ReactNode }) {
    const [title, setTitle] = useState<string | null>(null);

    return (
        <ProjectTitleContext.Provider value={{ title, setTitle }}>
            {children}
        </ProjectTitleContext.Provider>
    );
}

export function useProjectTitle() {
    const context = useContext(ProjectTitleContext);

    if (context === undefined) {
        throw new Error("useProjectTitle must be used within a ProjectTitleProvider");
    }

    return context;
}
