import { redirect } from "next/navigation";
import { getSession } from "@/lib/api/auth/session";
import { ROUTES } from "@/lib/routes";
import ProfileHeader from "@/components/features/profile/ProfileHeader";
import EditProfileCard from "@/components/features/profile/EditProfileCard";
import ChangePasswordCard from "@/components/features/profile/ChangePasswordCard";
import AccountInfoCard from "@/components/features/profile/AccountInfoCard";

export default async function ProfilePage() {
    const user = await getSession();

    if (!user) {
        redirect(ROUTES.LOGIN);
    }

    return (
        <div className="flex flex-col gap-5 pb-8">
            <ProfileHeader username={user.username} fullName={user.fullName} avatarUrl={user.avatarUrl} />

            <EditProfileCard
                initialValues={{
                    username: user.username,
                    email: user.email ?? "",
                    fullName: user.fullName ?? "",
                    avatarUrl: user.avatarUrl ?? "",
                }}
            />

            <ChangePasswordCard />

            <AccountInfoCard createdAt={user.createdAt} />
        </div>
    );
}
