export type ProjectStatus = "ongoing" | "completed";

export type ProjectLinkCategory = "design" | "development" | "docs" | "other";

export type ProjectMemberRole = "leader" | "member";

export type ProjectMember = {
  id: number;
  userId: number;
  username: string;
  avatarUrl: string | null;
  role: ProjectMemberRole;
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
  members?: ProjectMember[]; // belum ada atau belum disertakan di endpoint jadi masih optional
  links?: ProjectLink[]; // ini sama dengan yang atas
};

export type CreateProjectLinkPayload = {
  label: string;
  url: string;
  category: ProjectLinkCategory;
};

export type CreateProjectPayload = {
  project: {
    title: string;
    allowFreeSwap?: boolean;
    deadline: string;
  };
  links?: CreateProjectLinkPayload[];
};
