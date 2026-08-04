import { ReactNode } from "react";
import { cn } from "@/utils/cn";
import MobileTopBar from "./MobileTopBar";
import MobileBottomBar from "./MobileBottomBar";

interface MobileLayoutProps {
    className?: string;
    children: ReactNode;
}

export default function MobileLayout({
    className,
    children,
}: MobileLayoutProps) {
    return (
        <div className={cn("min-h-screen flex flex-col", className)}>
            <MobileTopBar workspaceName="KerjainYu" user={undefined}/>

            <main className="flex-1">
                {children}
            </main>

            <MobileBottomBar />
        </div>
    );
}