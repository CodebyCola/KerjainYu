import { UserRound } from "lucide-react";
import { getInitials } from "@/utils/getInitials";

type ProfileHeaderProps = {
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
};

export default function ProfileHeader({ username, fullName, avatarUrl }: ProfileHeaderProps) {
    const initials = getInitials(fullName ?? username);

    return (
        <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary sm:size-20">
                {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={avatarUrl}
                        alt={fullName ?? username}
                        className="size-full object-cover"
                    />
                ) : (
                    <span className="font-inter text-lg font-semibold text-primary-foreground sm:text-xl">
                        {initials}
                    </span>
                )}
            </div>

            <div className="min-w-0">
                <h2 className="flex items-center gap-2 truncate font-inter text-xl font-semibold text-foreground md:text-2xl">
                    <UserRound className="size-5 shrink-0 text-muted" />
                    <span className="truncate">{fullName || username}</span>
                </h2>
                <p className="mt-1 truncate text-sm font-inter text-muted">@{username}</p>
            </div>
        </div>
    );
}
