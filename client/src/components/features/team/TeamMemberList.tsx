"use client";

import { useState } from "react";
import { TeamMember } from "@/types/team";
import MemberListItem from "@/components/features/team/MemberListItem";
import RemoveMemberDialog from "@/components/features/team/RemoveMemberDialog";

type TeamMemberListProps = {
    initialMembers: TeamMember[];
    canManage: boolean;
};

export default function TeamMemberList({ initialMembers, canManage }: TeamMemberListProps) {
    const [members, setMembers] = useState(initialMembers);
    const [pendingRemoval, setPendingRemoval] = useState<TeamMember | null>(null);

    // TODO: ganti dengan PATCH /api/v1/project/:id/members/:memberId { role: "leader" }.
    // Lihat README bagian "PATCH /api/v1/project/:id/members/:memberId".
    function handleMakeLeader(member: TeamMember) {
        setMembers((prev) =>
            prev.map((m) => {
                if (m.id === member.id) return { ...m, role: "leader" };
                if (m.role === "leader") return { ...m, role: "member" };
                return m;
            })
        );
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
            <div className="flex flex-col gap-2.5">
                {members.map((member) => (
                    <MemberListItem
                        key={member.id}
                        member={member}
                        canManage={canManage}
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