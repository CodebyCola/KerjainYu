"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import ProjectSubNav from "@/components/layout/ProjectSubNav";
import { getProjectIdFromPathname } from "@/lib/routes";
import { type User } from "@/types/user";

type TabletLayoutProps = {
    user?: User;
    children: ReactNode;
};

export default function TabletLayout({ user, children }: TabletLayoutProps) {
    const pathname = usePathname();
    const projectId = getProjectIdFromPathname(pathname);

    return (
        <div className="flex w-full h-screen bg-background">
            <Sidebar variant="icon-only" />

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Topbar user={user} />
                {projectId && <ProjectSubNav projectId={projectId} />}
                <main className="flex-1 w-full overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
