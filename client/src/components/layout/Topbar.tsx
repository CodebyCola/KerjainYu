import { Bell } from "lucide-react";
import UserMenu from "@/components/layout/UserMenu";
import { type User } from "@/types/user";

type TopbarProps = {
    user?: User;
};

export default function Topbar({ user }: TopbarProps) {
    return (
        <header className="h-16 w-full border-b border-b-border bg-background shrink-0">
            <div className="flex items-center justify-end h-full px-6 gap-5">
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative"
                >
                    <Bell size={22} className="text-muted" />
                    <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-status-blocked-text" />
                </button>
                <UserMenu user={user} align="right" />
            </div>
        </header>
    );
}