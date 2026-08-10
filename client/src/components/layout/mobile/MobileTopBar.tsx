import { APP_NAME } from "@/lib/constants";
import UserMenu from "@/components/layout/UserMenu";
import { type User } from "@/types/user";
import { getInitials } from "@/utils/getInitials";

type MobileTopBarProps = {
    user?: User;
};

export default function MobileTopBar({ user }: MobileTopBarProps) {
    return (
        <header className="h-16 border-b border-b-border bg-background">
            <div className="flex items-center justify-between h-full px-4">
                {/* Brand */}
                <div className="flex flex-row items-center gap-1">
                    <div className="size-9 rounded-lg bg-status-progress-bg flex items-center justify-center text-sm font-inter font-semibold text-status-progress-text shrink-0">
                        {getInitials(APP_NAME)}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">

                    <UserMenu user={user} align="right" />
                </div>
            </div>
        </header>
    );
}