import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { getInitials } from "@/utils/getInitials";
import { getSession } from "@/lib/api/auth/session";
import AuthBackground from "@/components/features/auth/AuthBackground";
import AuthNavCard from "@/components/features/auth/AuthNavCard";
import AuthTransition from "@/components/features/auth/AuthTransition";

type AuthLayoutProps = {
    children: ReactNode;
};

export default async function AuthLayout({ children }: AuthLayoutProps) {
    const user = await getSession();

    if (user) {
        redirect(ROUTES.PROJECTS);
    }

    return (
        <div className="relative h-dvh w-full overflow-hidden bg-background">
            <AuthBackground />

            <div
                className="relative z-10 flex h-dvh w-full justify-center px-4"
                style={{
                    paddingTop: "clamp(0.5rem, 3vh, 2rem)",
                    paddingBottom: "clamp(0.5rem, 3vh, 2rem)",
                }}
            >
                <div className="flex w-full max-w-md flex-col min-h-0">
                    {/* Brand */}
                    <Link
                        href={ROUTES.PROJECTS}
                        aria-label={`Kembali ke beranda ${APP_NAME}`}
                        className="flex shrink-0 items-center justify-center gap-2"
                        style={{ marginBottom: "clamp(0.25rem, 2vh, 1.5rem)" }}
                    >
                        <div className="size-9 rounded-lg bg-status-progress-bg flex items-center justify-center text-sm font-inter font-semibold text-status-progress-text shrink-0">
                            {getInitials(APP_NAME)}
                        </div>
                        <span className="text-lg font-inter font-semibold text-foreground">
                            {APP_NAME}
                        </span>
                    </Link>

                    {/* Head card */}
                    <div
                        className="flex shrink-0 justify-center"
                        style={{ marginBottom: "clamp(0.25rem, 1.5vh, 1.25rem)" }}
                    >
                        <AuthNavCard />
                    </div>

                    {/* Auth form card */}
                    <div
                        className="min-h-0 overflow-y-auto rounded-2xl border border-border bg-card shadow-lg"
                        style={{ padding: "clamp(0.875rem, 3vh, 1.75rem)" }}
                    >
                        <AuthTransition>{children}</AuthTransition>
                    </div>
                </div>
            </div>
        </div>
    );
}