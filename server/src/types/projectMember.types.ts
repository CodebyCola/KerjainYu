export type ProjectRole = 'leader' | 'member';
export type MemberStatus = 'invited' | 'active' | 'removed';

export interface ProjectMember {
id: number;
project_id: number;
user_id: number;
role: ProjectRole;
joined_at: Date;
status: MemberStatus;
}