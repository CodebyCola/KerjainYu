import { ReactNode } from "react";
import MobileTopBar from "./MobileTopBar";
import MobileBottomBar from "./MobileBottomBar";
import { type User } from "@/types/user";

type MobileLayoutProps = {
    user?: User;
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