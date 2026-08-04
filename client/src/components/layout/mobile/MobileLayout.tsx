import { ReactNode } from "react";
import MobileTopBar from "./MobileTopBar";
import MobileBottomBar from "./MobileBottomBar";

type MobileLayoutProps = {
    user?: { name?: string | null; avatarUrl?: string | null };
    children: ReactNode;
};

export default function MobileLayout({ user, children }: MobileLayoutProps) {
    return (
        <div className="flex flex-col w-full h-screen bg-background">
            <MobileTopBar user={user} />

            <main className="flex-1 overflow-y-auto w-full">{children}</main>

            <MobileBottomBar />
        </div>
    );
}