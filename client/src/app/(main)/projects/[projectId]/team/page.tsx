import { notFound } from "next/navigation";
import { getProject } from "@/lib/api/projects/projects";
import { DUMMY_TEAM_MEMBERS } from "./dummyTeamData";
import TeamHeader from "@/components/features/team/TeamHeader";
import TeamMemberList from "@/components/features/team/TeamMemberList";

type TeamPageProps = {
    params: Promise<{ projectId: string }>;
};

export default async function TeamPage({ params }: TeamPageProps) {
    const { projectId } = await params;

    const detail = await getProject(projectId);

    if (!detail) {
        notFound();
    }

    // TODO: DUMMY_TEAM_MEMBERS diganti dengan fetch ke
    // GET /api/v1/project/:id/members begitu endpoint tersedia — lihat README.
    const members = DUMMY_TEAM_MEMBERS;
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