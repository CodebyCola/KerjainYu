import { ReactNode } from "react";
import MobileLayout from "@/components/layout/mobile/MobileLayout";
import TabletLayout from "@/components/layout/tablet/TabletLayout";
import DesktopLayout from "@/components/layout/desktop/DesktopLayout";
import { type User } from "@/types/user";

type ResponsiveLayoutProps = {
    user?: User;
    children: ReactNode;
};

export default function ResponsiveLayout({ user, children }: ResponsiveLayoutProps) {
    return (
        <>
            {/* Mobile: < md */}
            <div className="w-full h-screen md:hidden">
                <MobileLayout user={user}>{children}</MobileLayout>
            </div>

            {/* Tablet: md - lg */}
            <div className="hidden w-full h-screen md:flex lg:hidden">
                <TabletLayout user={user}>{children}</TabletLayout>
            </div>

            {/* Desktop: >= lg */}
            <div className="hidden w-full h-screen lg:flex">
                <DesktopLayout user={user}>{children}</DesktopLayout>
            </div>
        </>
    );
}