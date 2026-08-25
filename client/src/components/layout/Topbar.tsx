import UserMenu from "@/components/layout/UserMenu";
import NotificationBell from "@/components/layout/NotificationBell";
import { type User } from "@/types/user";

type TopbarProps = {
    user?: User;
};

export default function Topbar({ user }: TopbarProps) {
    return (
        <header className="h-16 w-full border-b border-b-border bg-background shrink-0">
            <div className="flex items-center justify-end h-full px-6 gap-5">
                <NotificationBell />
                <UserMenu user={user} align="right" />
            </div>
        </header>
    );
}