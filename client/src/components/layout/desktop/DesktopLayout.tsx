import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

type DesktopLayoutProps = {
    user?: { name?: string | null; avatarUrl?: string | null };
    children: ReactNode;
};

export default function DesktopLayout({ user, children }: DesktopLayoutProps) {
    return (
        <div className="flex w-full h-screen bg-background">
            <Sidebar variant="full" />

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Topbar user={user} />
                <main className="flex-1 w-full overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}