import { notFound } from "next/navigation";
import { getProject } from "@/lib/api/projects/projects";
import { getProjectMembers } from "@/lib/api/members/members";
import { TeamMember } from "@/types/team";
import { ProjectMember } from "@/types/project";
import TeamHeader from "@/components/features/team/TeamHeader";
import TeamMemberList from "@/components/features/team/TeamMemberList";

type TeamPageProps = {
    params: Promise<{ projectId: string }>;
};

// GET /projects/:id/members saat ini cuma mengembalikan member berstatus
// "active" dan belum punya field fullName/joinedAt — lihat SERVER_REQUEST.md.
// Sampai server menambahkannya, field itu di-default seaman mungkin (null)
// alih-alih ditebak, dan status selalu "active" karena memang cuma itu yang
// pernah dikirim endpoint ini (member "invited" tidak akan muncul di sini).
function toTeamMember(member: ProjectMember): TeamMember {
    return {
        id: member.id,
        userId: member.userId,
        username: member.username,
        fullName: null,
        avatarUrl: member.avatarUrl,
        role: member.role,
        status: "active",
        joinedAt: null,
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

    return (
        <div className="flex flex-col gap-5">
            <TeamHeader
                projectId={projectId}
                projectTitle={detail.project.title}
                members={members}
                canManage={canManage}
            />
            <TeamMemberList initialMembers={members} canManage={canManage} />
        </div>
    );
}