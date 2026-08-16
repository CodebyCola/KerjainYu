import { Users } from "lucide-react";
import { TeamMember } from "@/types/team";
import AddMemberButton from "@/components/features/team/AddMemberButton";

type TeamHeaderProps = {
    projectId: string;
    projectTitle: string;
    members: TeamMember[];
    canManage: boolean;
};

export default function TeamHeader({ projectId, projectTitle, members, canManage }: TeamHeaderProps) {
    const activeCount = members.filter((m) => m.status === "active").length;
    const pendingCount = members.filter((m) => m.status === "invited").length;

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="flex items-center gap-2 font-inter text-xl font-semibold text-foreground md:text-2xl">
                    <Users className="size-5 text-muted" />
                    Tim
                </h2>
                <p className="mt-1 text-sm font-inter text-muted">
                    {projectTitle} · {activeCount} anggota aktif
                    {pendingCount > 0 && ` · ${pendingCount} menunggu konfirmasi`}
                </p>
            </div>

            {canManage && <AddMemberButton projectId={projectId} />}
        </div>
    );
}