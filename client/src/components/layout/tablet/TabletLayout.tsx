import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { type User } from "@/types/user";

type TabletLayoutProps = {
    user?: User;
    children: ReactNode;
};

export default function TabletLayout({ user, children }: TabletLayoutProps) {
    return (
        <div className="flex w-full h-screen bg-background">
            <Sidebar variant="icon-only" />

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Topbar user={user} />
                <main className="flex-1 w-full overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}