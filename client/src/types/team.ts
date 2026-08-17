import { type ProjectMemberRole } from "./project";

export type ProjectMemberStatus = "invited" | "active" | "removed";

export type TeamMember = {
  id: number;
  userId: number;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: ProjectMemberRole;
  status: ProjectMemberStatus;
  joinedAt: string | null;
};

export type UserSearchResult = {
  id: number;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
};
