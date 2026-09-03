export type ProjectStatus = "ongoing" | "completed";

export type ProjectLinkCategory = "design" | "development" | "docs" | "other";

export type ProjectMemberRole = "leader" | "member";

export type ProjectMember = {
  id: number;
  userId: number;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: ProjectMemberRole;
  joinedAt?: string | null;
};

export type ProjectLink = {
  id: number;
  label: string;
  url: string;
  category: ProjectLinkCategory;
};

export type Project = {
  id: number;
  title: string;
  status: ProjectStatus;
  allowFreeSwap: boolean;
  deadline: string;
  isArchived: boolean;
  createdAt: string;
  members: ProjectMember[];
};

export type CreateProjectLinkPayload = {
  label: string;
  url: string;
  category: ProjectLinkCategory;
};

export type UpdateProjectLinkPayload = Partial<CreateProjectLinkPayload>;

export type ProjectMembership = {
  userId: number;
  role: ProjectMemberRole;
};

export type ProjectDetailResponse = {
  project: Project;
  membership: ProjectMembership;
  links: ProjectLink[];
};

export type UpdateProjectPayload = Partial<{
  title: string;
  allowFreeSwap: boolean;
  status: ProjectStatus;
  deadline: string;
  isArchived: boolean;
}>;

export type CreateProjectPayload = {
  project: {
    title: string;
    allowFreeSwap?: boolean;
    deadline: string;
  };
  links?: CreateProjectLinkPayload[];
};