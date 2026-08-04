import { Bell } from "lucide-react";
import { getInitials } from "@/utils/getInitials";

type User = {
    name?: string | null;
    avatarUrl?: string | null;
};

type MobileTopBarProps = {
    workspaceName: string;
    user?: User;
};

export default function MobileTopBar({ workspaceName, user }: MobileTopBarProps) {
    const initials = getInitials(user?.name);

    return (
        <header className="h-16 border-b border-b-border bg-background">
            <div className="flex items-center justify-between h-full px-4">
                {/* Workspace */}
                <div className="flex flex-col leading-tight">
                    <h1 className="text-lg font-inter font-semibold text-foreground">
                        {workspaceName}
                    </h1>
                    <span className="text-xs font-inter text-muted">
                        Workspace
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* <button
                        type="button"
                        aria-label="Notifications"
                        className="relative"
                    >
                        <Bell size={22} className="text-muted" />
                        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-status-blocked-text" />
                    </button> */}

                    <button
                        type="button"
                        aria-label="Profile"
                        className="size-9 rounded-full bg-primary flex items-center justify-center overflow-hidden"
                    >
                        {user?.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={user.avatarUrl}
                                alt={user?.name ?? "User avatar"}
                                className="size-full object-cover"
                            />
                        ) : (
                            <span className="text-xs font-inter font-semibold text-primary-foreground">
                                {initials}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}