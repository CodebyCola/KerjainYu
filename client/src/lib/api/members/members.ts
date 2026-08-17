import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { ProjectMember } from "@/types/project";
import { apiFetch } from "../fetcher";

function projectMembersPath(projectId: string) {
  return `/projects/${projectId}/members`;
}

function projectInvitationsPath(projectId: string) {
  return `/projects/${projectId}/invitations`;
}

function projectLeaderPath(projectId: string) {
  return `/projects/${projectId}/leader`;
}

export function getProjectMembersRequest(projectId: string, cookie: string) {
  return apiFetch<ProjectMember[]>(projectMembersPath(projectId), { cookie });
}

export const getProjectMembers = cache(
  async (projectId: string): Promise<ProjectMember[]> => {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    try {
      const { data } = await getProjectMembersRequest(projectId, cookieHeader);
      return data;
    } catch {
      return [];
    }
  },
);

export function inviteMemberRequest(
  projectId: string,
  userId: number,
  cookie: string,
) {
  return apiFetch<null>(projectInvitationsPath(projectId), {
    method: "POST",
    body: { userId },
    cookie,
  });
}

export function promoteToLeaderRequest(
  projectId: string,
  userId: number,
  cookie: string,
) {
  return apiFetch<null>(projectLeaderPath(projectId), {
    method: "PATCH",
    body: { userId },
    cookie,
  });
}
