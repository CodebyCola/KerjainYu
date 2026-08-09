import { APP_NAME } from "@/lib/constants";
import UserMenu from "@/components/layout/UserMenu";

type User = {
    name?: string | null;
    avatarUrl?: string | null;
};

type MobileTopBarProps = {
    user?: User;
};

export default function MobileTopBar({ user }: MobileTopBarProps) {
    return (
        <header className="h-16 border-b border-b-border bg-background">
            <div className="flex items-center justify-between h-full px-4">
                {/* Brand */}
                <h1 className="text-lg font-inter font-semibold text-foreground">
                    {APP_NAME}
                </h1>

                {/* Actions */}
                <div className="flex items-center gap-4">

                    <UserMenu user={user} align="right" />
                </div>
            </div>
        </header>
    );
}