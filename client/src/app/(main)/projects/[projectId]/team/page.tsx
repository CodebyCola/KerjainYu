import { notFound } from "next/navigation";
import { getProject } from "@/lib/api/projects/projects";
import { getProjectMembers } from "@/lib/api/members/members";
import { TeamMember } from "@/types/team";
import { ProjectMember } from "@/types/project";
import TeamHeader from "@/components/features/team/TeamHeader";
import TeamMemberList from "@/components/features/team/TeamMemberList";
import LeaveProjectButton from "@/components/features/team/LeaveProjectButton";

type TeamPageProps = {
    params: Promise<{ projectId: string }>;
};

function toTeamMember(member: ProjectMember): TeamMember {
    return {
        id: member.id,
        userId: member.userId,
        username: member.username,
        fullName: member.fullName,
        avatarUrl: member.avatarUrl,
        role: member.role,
        status: "active",
        joinedAt: member.joinedAt ?? null,
    };
}

export default async function TeamPage({ params }: TeamPageProps) {
    const { projectId } = await params;

    const detail = await getProject(projectId);

    if (!detail) {
        notFound();
    }

    const projectMembers = await getProjectMembers(projectId);
    const members = projectMembers.map(toTeamMember);
    const canManage = detail.membership.role === "leader";
    const currentUserId = detail.membership.userId;
    const hasOtherActiveMembers = members.some((member) => member.userId !== currentUserId);

    return (
        <div className="flex flex-col gap-5">
            <TeamHeader
                projectId={projectId}
                projectTitle={detail.project.title}
                members={members}
                canManage={canManage}
            />
            <TeamMemberList projectId={projectId} initialMembers={members} canManage={canManage} />

            <LeaveProjectButton
                projectId={projectId}
                projectTitle={detail.project.title}
                isLeader={canManage}
                hasOtherActiveMembers={hasOtherActiveMembers}
            />
        </div>
    );
}