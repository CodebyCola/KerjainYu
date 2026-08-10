export type ProjectRole = 'leader' | 'member';
export type MemberStatus = 'invited' | 'active' | 'removed';

export interface ProjectMember {
    id: number;
    projectId: number;
    userId: number;
    role: ProjectRole;
    joinedAt: Date;
    status: MemberStatus;
}

export interface Role {
    userId: number, role: ProjectRole
}