import type { ReactNode } from "react";
import MobileLayout from "./mobile/MobileLayout";

interface ResponsiveLayoutProps {
    children: ReactNode;
}

export default function ResponsiveLayout({
    children,
}: ResponsiveLayoutProps) {
    return (
        <>
            <MobileLayout className="lg:hidden md:hidden">
                {children}
            </MobileLayout>

            {/* <DesktopLayout className="hidden lg:flex">
                {children}
            </DesktopLayout> */}
        </>
    );
}