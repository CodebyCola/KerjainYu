import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { ProjectMember } from "@/types/project";
import { apiFetch } from "../fetcher";

function projectMembersPath(projectId: string) {
  return `/projects/${projectId}/members`;
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
