"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type AuthTransitionProps = {
    children: ReactNode;
};

export default function AuthTransition({ children }: AuthTransitionProps) {
    const pathname = usePathname();

    return (
        <div key={pathname} className="animate-auth-fade-in">
            {children}
        </div>
    );
}