"use client";

import { useState, useTransition } from "react";
import { TeamMember } from "@/types/team";
import MemberListItem from "@/components/features/team/MemberListItem";
import RemoveMemberDialog from "@/components/features/team/RemoveMemberDialog";
import { promoteToLeaderAction } from "@/app/(main)/projects/[projectId]/team/actions";

type TeamMemberListProps = {
    projectId: string;
    initialMembers: TeamMember[];
    canManage: boolean;
};

export default function TeamMemberList({ projectId, initialMembers, canManage }: TeamMemberListProps) {
    const [members, setMembers] = useState(initialMembers);
    const [pendingRemoval, setPendingRemoval] = useState<TeamMember | null>(null);
    const [promotingId, setPromotingId] = useState<number | null>(null);
    const [promoteError, setPromoteError] = useState<string | null>(null);

    const [isPromoting, startPromote] = useTransition();

    // PATCH /api/v1/projects/:id/leader — optimistic update, rollback kalau server menolak
    // (mis. target sudah bukan member aktif lagi / konflik lain).
    function handleMakeLeader(member: TeamMember) {
        if (promotingId !== null) return; // cegah promote lain menyusul sebelum yang berjalan selesai

        const previousMembers = members;

        setPromotingId(member.id);
        setPromoteError(null);
        setMembers((prev) =>
            prev.map((m) => {
                if (m.id === member.id) return { ...m, role: "leader" };
                if (m.role === "leader") return { ...m, role: "member" };
                return m;
            })
        );

        startPromote(async () => {
            const result = await promoteToLeaderAction(projectId, member.userId);
            setPromotingId(null);

            if (!result.success) {
                setMembers(previousMembers);
                setPromoteError(result.error ?? "Gagal menjadikan ketua.");
            }
        });
    }

    // TODO: ganti dengan DELETE /api/v1/project/:id/members/:memberId.
    // Lihat README bagian "DELETE /api/v1/project/:id/members/:memberId".
    function handleConfirmRemove() {
        if (!pendingRemoval) return;
        setMembers((prev) => prev.filter((m) => m.id !== pendingRemoval.id));
        setPendingRemoval(null);
    }

    if (members.length === 0) {
        return (
            <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm font-inter text-muted">
                Belum ada anggota di proyek ini.
            </p>
        );
    }

    return (
        <>
            {promoteError && (
                <p className="mb-2.5 text-sm font-inter text-status-blocked-text">{promoteError}</p>
            )}

            <div className="flex flex-col gap-2.5">
                {members.map((member) => (
                    <MemberListItem
                        key={member.id}
                        member={member}
                        canManage={canManage}
                        isPromoting={isPromoting && promotingId === member.id}
                        onMakeLeader={handleMakeLeader}
                        onRemove={setPendingRemoval}
                    />
                ))}
            </div>

            <RemoveMemberDialog
                member={pendingRemoval}
                onCancel={() => setPendingRemoval(null)}
                onConfirm={handleConfirmRemove}
            />
        </>
    );
}