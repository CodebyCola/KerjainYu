import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { getProject } from "@/lib/api/projects/projects";
import { ApiRequestError } from "@/lib/api/apiRequestError";
import { DUMMY_TEAM_MEMBERS } from "./dummyTeamData";
import TeamHeader from "@/components/features/team/TeamHeader";
import TeamMemberList from "@/components/features/team/TeamMemberList";

type TeamPageProps = {
    params: Promise<{ projectId: string }>;
};

export default async function TeamPage({ params }: TeamPageProps) {
    const { projectId } = await params;

    let detail;
    try {
        detail = await getProject(projectId);
    } catch (err) {
        if (err instanceof ApiRequestError && err.code === "NOT_FOUND") {
            notFound();
        }
        if (err instanceof ApiRequestError && err.code === "FORBIDDEN") {
            return (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
                    <AlertTriangle className="size-8 text-muted" />
                    <p className="font-inter text-sm text-muted">
                        Kamu bukan anggota proyek ini, jadi belum bisa melihat halamannya.
                    </p>
                </div>
            );
        }
        throw err;
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
